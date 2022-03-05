import {ChromosomeGenerator} from '../../search/ChromosomeGenerator';
import {SearchAlgorithmProperties} from "../../search/SearchAlgorithmProperties";
import {SearchAlgorithmDefault} from "../../search/algorithms/SearchAlgorithmDefault";
import {FitnessFunction} from "../../search/FitnessFunction";
import {StatisticsCollector} from "../../utils/StatisticsCollector";
import {NeatPopulation} from "../NeuroevolutionPopulations/NeatPopulation";
import {NetworkFitnessFunction} from "../NetworkFitness/NetworkFitnessFunction";
import {RandomNeuroevolutionPopulation} from "../NeuroevolutionPopulations/RandomNeuroevolutionPopulation";
import Arrays from "../../utils/Arrays";
import {NeatProperties} from "../HyperParameter/NeatProperties";
import {NeatChromosome} from "../Networks/NeatChromosome";
import {NeatTrainPopulation} from "../NeuroevolutionPopulations/NeatTrainPopulation";

export class NEAT extends SearchAlgorithmDefault<NeatChromosome> {

    /**
     * The search parameters.
     */
    protected _neuroevolutionProperties: NeatProperties;

    /**
     * The fitnessFunction used to evaluate the networks of Neuroevolution Algorithm.
     */
    protected _networkFitnessFunction: NetworkFitnessFunction<NeatChromosome>;

    /**
     * Evaluates the networks by letting them play the given Scratch game.
     * @param networks the networks to evaluate -> Current population
     */
    protected async evaluateNetworks(networks: NeatChromosome[]): Promise<void> {
        for (const network of networks) {
            // Evaluate the networks by letting them play the game.
            await this._networkFitnessFunction.getFitness(network, this._neuroevolutionProperties.timeout, this._neuroevolutionProperties.eventSelection);
            // Update the archive and stop in the middle of the evaluation if we already cover all statements.
            this.updateArchive(network);
            if ((this._stoppingCondition.isFinished(this))) {
                return;
            }
        }
    }

    /**
     * Returns a list of solutions for the given problem.
     * @returns Solution for the given problem
     */
    async findSolution(): Promise<Map<number, NeatChromosome>> {
        const population = this.getPopulation();
        population.generatePopulation();
        this._iterations = 0;
        this._startTime = Date.now();

        while (!(this._stoppingCondition.isFinished(this))) {
            await this.evaluateNetworks(population.networks);
            population.updatePopulationStatistics();
            this.reportOfCurrentIteration(population);
            this.updateBestIndividualAndStatistics(population);
            population.evolve();
            this._iterations++;
        }
        return this._archive as Map<number, NeatChromosome>;
    }

    /**
     * Re-trains an existing set of networks on a (new) project.
     * @param startingNetworks the networks that will serve as a starting point for the re-train process.
     * @param parameter the parameters used during re-training.
     * @returns List of re-trained networks.
     */
    public async train(startingNetworks: NeatChromosome[], parameter: NeatProperties): Promise<NeatChromosome[]> {
        this._neuroevolutionProperties = parameter;
        this._stoppingCondition = this._neuroevolutionProperties.stoppingCondition;
        this._networkFitnessFunction = this._neuroevolutionProperties.networkFitness;
        const population = this.getPopulation(startingNetworks);
        population.generatePopulation();
        this._iterations = 0;
        this._startTime = Date.now();

        while (!(this._stoppingCondition.isFinished(this))) {
            await this.evaluateNetworks(population.networks);
            population.updatePopulationStatistics();
            this.reportOfCurrentIteration(population);
            this.updateBestIndividualAndStatistics(population);
            population.evolve();
            this._iterations++;
        }
        return Arrays.distinct([...this._archive.values()]);
    }

    /**
     * Updates the archive of covered block statements. Each chromosome is mapped to the block it covers.
     * Additionally, we save the best performing chromosome regarding the achieved network fitness.
     *
     * @param candidateChromosome The candidate chromosome to update the archive with.
     */
    protected updateArchive(candidateChromosome: NeatChromosome): void {

        // We save the first chromosome which managed to cover a block instead of the best performing network since
        // otherwise the dynamic test suite later fails to cover the easiest blocks, e.g. simple GameOver state.
        // For fairness, we do the same if a static test suite is targeted.
        // Because we are nonetheless interested in the best performing network, we include the best performing
        // network as an additional key to the archive in the case of a dynamic TestSuite.
        for (const fitnessFunctionKey of this._fitnessFunctions.keys()) {
            const fitnessFunction = this._fitnessFunctions.get(fitnessFunctionKey);
            const statementFitness = fitnessFunction.getFitness(candidateChromosome);
            if (fitnessFunction.isOptimal(statementFitness) && !this._archive.has(fitnessFunctionKey)) {
                StatisticsCollector.getInstance().incrementCoveredFitnessFunctionCount(fitnessFunction);
                this._archive.set(fitnessFunctionKey, candidateChromosome);
            }
        }

        // Save the best performing chromosome
        const bestNetworkKey = this._fitnessFunctions.size + 1;
        if (!this._archive.has(bestNetworkKey) ||
            this._archive.get(bestNetworkKey).fitness < candidateChromosome.fitness) {
            this._archive.set(bestNetworkKey, candidateChromosome);
        }
        this._bestIndividuals = Arrays.distinctObjects([...this._archive.values()]);
    }

    /**
     * Generate the desired type of NeuroevolutionPopulation to be used by the NEAT algorithm.
     * @returns NeuroevolutionPopulation defined in the config files.
     */
    protected getPopulation(startingNetworks?: NeatChromosome[]): NeatPopulation {
        switch (this._neuroevolutionProperties.populationType) {
            case 'random':
                return new RandomNeuroevolutionPopulation(this._chromosomeGenerator, this._neuroevolutionProperties);
            case 'train':
                return new NeatTrainPopulation(this._neuroevolutionProperties, startingNetworks);
            case 'dynamic':
            case 'neat':
            default:
                return new NeatPopulation(this._chromosomeGenerator, this._neuroevolutionProperties);
        }
    }

    /**
     * Updates the List of the best networks found so far and the statistics used for reporting. Order is important!
     * @param population the current generation's population of networks.
     */
    protected updateBestIndividualAndStatistics(population: NeatPopulation): void {
        this._bestIndividuals = Arrays.distinct(this._archive.values());
        StatisticsCollector.getInstance().bestTestSuiteSize = this._bestIndividuals.length;
        StatisticsCollector.getInstance().incrementIterationCount();
        StatisticsCollector.getInstance().coveredFitnessFunctionsCount = this._archive.size - 1;
        StatisticsCollector.getInstance().updateHighestNetworkFitness(population.populationChampion.fitness);

        const highestFitness = Math.max(...population.networks.map(n => n.fitness));
        const highestScore = Math.max(...population.networks.map(n => n.score));
        const highestSurvive = Math.max(...population.networks.map(n => n.playTime));
        StatisticsCollector.getInstance().updateHighestScore(highestScore);
        StatisticsCollector.getInstance().updateHighestPlaytime(highestSurvive);

        // Update TimeLine
        const timeLineValues: [number, number, number, number] = [this._archive.size, highestFitness, highestScore,
            highestSurvive];
        StatisticsCollector.getInstance().updateFitnessOverTime(
            StatisticsCollector.getInstance().numberFitnessEvaluations, timeLineValues);

        if (this._archive.size == this._fitnessFunctions.size && !this._fullCoverageReached) {
            this._fullCoverageReached = true;
            StatisticsCollector.getInstance().createdTestsToReachFullCoverage =
                (this._iterations + 1) * this._neuroevolutionProperties.populationSize;
            StatisticsCollector.getInstance().timeToReachFullCoverage = Date.now() - this._startTime;
        }
    }

    /**
     * Reports the current state of the search.
     * @param population the population of networks
     */
    protected reportOfCurrentIteration(population: NeatPopulation): void {
        console.log(`Iteration:  ${this._iterations}`);
        console.log(`Best Network Fitness:  ${population.bestFitness}`);
        console.log(`Current Iteration Best Network Fitness:  ${population.populationChampion.fitness}`);
        console.log(`Average Network Fitness: ${population.averageFitness}`)
        console.log(`Generations passed since last improvement: ${population.highestFitnessLastChanged}`);
        for (const species of population.species) {
            console.log(`Species ${species.uID} has ${species.networks.length} members and an average fitness of ${species.averageFitness}`);
        }
        for (const fitnessFunctionKey of this._fitnessFunctions.keys()) {
            if (!this._archive.has(fitnessFunctionKey)) {
                console.log(`Not covered: ${this._fitnessFunctions.get(fitnessFunctionKey).toString()}`);
            }
        }
        console.log(`Time passed in seconds: ${(Date.now() - this.getStartTime())}`);
        console.log(`Covered goals: ${this._archive.size - 1 + "/" + this._fitnessFunctions.size}`);
        if (this._neuroevolutionProperties.printPopulationRecord) {
            const currentPopulationRecord = {}
            currentPopulationRecord[`Generation ${this._iterations}`] = population;
            console.log(`PopulationRecord: \n ${JSON.stringify(currentPopulationRecord, undefined, 4)}`)
        }
        console.log("-----------------------------------------------------")
    }

    getStartTime(): number {
        return this._startTime;
    }

    setProperties(properties: SearchAlgorithmProperties<NeatChromosome>): void {
        this._neuroevolutionProperties = properties as unknown as NeatProperties;
        this._stoppingCondition = this._neuroevolutionProperties.stoppingCondition
        this._networkFitnessFunction = this._neuroevolutionProperties.networkFitness;
    }

    setChromosomeGenerator(generator: ChromosomeGenerator<NeatChromosome>): void {
        this._chromosomeGenerator = generator;
    }

    getNumberOfIterations(): number {
        return this._iterations;
    }

    getCurrentSolution(): NeatChromosome[] {
        return this._bestIndividuals as NeatChromosome[];
    }

    getFitnessFunctions(): Iterable<FitnessFunction<NeatChromosome>> {
        return this._fitnessFunctions.values();
    }

    setFitnessFunctions(fitnessFunctions: Map<number, FitnessFunction<NeatChromosome>>): void {
        this._fitnessFunctions = fitnessFunctions;
        StatisticsCollector.getInstance().fitnessFunctionCount = fitnessFunctions.size;
    }
}
