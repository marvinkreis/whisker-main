import {Preconditions} from "./Preconditions";
import {SearchAlgorithmProperties} from "../search/SearchAlgorithmProperties";
import {TestGenerator} from "../testgenerator/TestGenerator";
import {RandomTestGenerator} from "../testgenerator/RandomTestGenerator";
import {FixedIterationsStoppingCondition} from "../search/stoppingconditions/FixedIterationsStoppingCondition";
import {Mutation} from "../search/Mutation";
import {BitflipMutation} from "../bitstring/BitflipMutation";
import {IntegerListMutation} from "../integerlist/IntegerListMutation";
import {Crossover} from "../search/Crossover";
import {SinglePointCrossover} from "../search/operators/SinglePointCrossover";
import {RankSelection} from "../search/operators/RankSelection";
import {Selection} from "../search/Selection";
import {SearchAlgorithmType} from "../search/algorithms/SearchAlgorithmType";
import {ChromosomeGenerator} from "../search/ChromosomeGenerator";
import {BitstringChromosomeGenerator} from "../bitstring/BitstringChromosomeGenerator";
import {IntegerListChromosomeGenerator} from "../integerlist/IntegerListChromosomeGenerator";
import {TestChromosomeGenerator} from "../testcase/TestChromosomeGenerator";
import {IterativeSearchBasedTestGenerator} from "../testgenerator/IterativeSearchBasedTestGenerator";
import {ManyObjectiveTestGenerator} from "../testgenerator/ManyObjectiveTestGenerator";
import {FitnessFunctionType} from "../search/FitnessFunctionType";
import {TournamentSelection} from "../search/operators/TournamentSelection";
import {List} from "./List";
import {VariableLengthMutation} from "../integerlist/VariableLengthMutation";
import {SinglePointRelativeCrossover} from "../search/operators/SinglePointRelativeCrossover";
import {VariableLengthTestChromosomeGenerator} from "../testcase/VariableLengthTestChromosomeGenerator";
import {StoppingCondition} from "../search/StoppingCondition";
import {FixedTimeStoppingCondition} from "../search/stoppingconditions/FixedTimeStoppingCondition";
import {OneOfStoppingCondition} from "../search/stoppingconditions/OneOfStoppingCondition";
import {OptimalSolutionStoppingCondition} from "../search/stoppingconditions/OptimalSolutionStoppingCondition";
import {IllegalArgumentException} from "../core/exceptions/IllegalArgumentException";
import {NeuroevolutionTestGenerator} from "../testgenerator/NeuroevolutionTestGenerator";
import {NetworkChromosomeGeneratorSparse} from "../whiskerNet/NetworkGenerators/NetworkChromosomeGeneratorSparse";
import {NetworkChromosomeGeneratorFullyConnected} from "../whiskerNet/NetworkGenerators/NetworkChromosomeGeneratorFullyConnected";
import {NeatMutation} from "../whiskerNet/NeatMutation";
import {NeatCrossover} from "../whiskerNet/NeatCrossover";
import {Container} from "./Container";
import {DynamicScratchEventExtractor} from "../testcase/DynamicScratchEventExtractor";
import {NeuroevolutionProperties} from "../whiskerNet/NeuroevolutionProperties";
import {StatementNetworkFitness} from "../whiskerNet/NetworkFitness/StatementNetworkFitness";
import {NetworkFitnessFunction} from "../whiskerNet/NetworkFitness/NetworkFitnessFunction";
import {NetworkChromosome} from "../whiskerNet/NetworkChromosome";
import {ScoreFitness} from "../whiskerNet/NetworkFitness/ScoreFitness";
import {SurviveFitness} from "../whiskerNet/NetworkFitness/SurviveFitness";
import {CombinedNetworkFitness} from "../whiskerNet/NetworkFitness/CombinedNetworkFitness";
import {InputExtraction} from "../whiskerNet/InputExtraction";
import {ExecutedEventsStoppingCondition} from "../search/stoppingconditions/ExecutedEventsStoppingCondition";
import {FitnessEvaluationStoppingCondition} from "../search/stoppingconditions/FitnessEvaluationStoppingCondition";
import {ScratchEventExtractor} from "../testcase/ScratchEventExtractor";
import {StaticScratchEventExtractor} from "../testcase/StaticScratchEventExtractor";
import {NaiveScratchEventExtractor} from "../testcase/NaiveScratchEventExtractor";
import {JustWaitScratchEventExtractor} from "../testcase/JustWaitScratchEventExtractor";
import {LocalSearch} from "../search/operators/LocalSearch/LocalSearch";
import {ExtensionLocalSearch} from "../search/operators/LocalSearch/ExtensionLocalSearch";
import {ReductionLocalSearch} from "../search/operators/LocalSearch/ReductionLocalSearch";
import {EventSelector, ClusteringEventSelector, InterleavingEventSelector} from "../testcase/EventSelector";
import {BiasedVariableLengthMutation} from "../integerlist/BiasedVariableLengthMutation";
import {VariableLengthConstrainedChromosomeMutation} from "../integerlist/VariableLengthConstrainedChromosomeMutation";
import {TargetFitness} from "../whiskerNet/NetworkFitness/TargetFitness";
import {NeuroevolutionScratchEventExtractor} from "../testcase/NeuroevolutionScratchEventExtractor";
import {NoveltyTargetNetworkFitness} from "../whiskerNet/NetworkFitness/NoveltyTargetNetworkFitness";
import {BiasedVariableLengthConstrainedChromosomeMutation} from "../integerlist/BiasedVariableLengthConstrainedChromosomeMutation";
import {NetworkChromosomeGeneratorTemplateNetwork} from "../whiskerNet/NetworkGenerators/NetworkChromosomeGeneratorTemplateNetwork";
import {ScratchEvent} from "../testcase/events/ScratchEvent";
import {WaitEvent} from "../testcase/events/WaitEvent";

class ConfigException implements Error {
    message: string;
    name: string;

    constructor(message: string) {
        this.name = "ConfigException";
        this.message = message;

    }
}

export class WhiskerSearchConfiguration {

    private readonly dict: Record<string, any>;

    constructor(dict: Record<string, any>) {
        this.dict = Preconditions.checkNotUndefined(dict)
    }

    // TODO: Need variation here; we do not always need all properties, e.g MIO has no crossover
    public getSearchAlgorithmProperties(): SearchAlgorithmProperties<any> {
        const populationSize = this.dict['population-size'] as number;
        const chromosomeLength = this.dict['chromosome-length'] as number;
        const crossoverProbability = this.dict['crossover']['probability'] as number;
        const mutationProbability = this.dict['mutation']['probability'] as number;

        const properties = new SearchAlgorithmProperties(populationSize, chromosomeLength);

        properties.setMutationProbablity(mutationProbability);
        properties.setCrossoverProbability(crossoverProbability);
        properties.setMaxMutationCounter(this.dict['mutation']['maxMutationCountStart'] as number,
            this.dict['mutation']['maxMutationCountFocusedPhase'] as number);
        properties.setSelectionProbabilities(this.dict['selection']['randomSelectionProbabilityStart'] as number,
            this.dict['selection']['randomSelectionProbabilityFocusedPhase'] as number);
        properties.setStartOfFocusedPhase(this.dict['startOfFocusedPhase'] as number);
        properties.setTestGenerator(this.dict['test-generator']);

        // Not all algorithms have special archive settings.
        if (this.dict['archive']) {
            properties.setMaxArchiveSizes(this.dict['archive']['maxArchiveSizeStart'] as number,
                this.dict['archive']['maxArchiveSizeFocusedPhase'] as number);
        }

        properties.setStoppingCondition(this._getStoppingCondition(this.dict['stopping-condition']));

        //TODO maybe we need to throw an error if we expect this and it is not here?
        if ("integerRange" in this.dict) {
            const integerRange = this.dict["integerRange"];
            properties.setIntRange(integerRange["min"], integerRange["max"]);
        }

        return properties;
    }

    public getNeuroevolutionProperties(): NeuroevolutionProperties<any> {
        const populationType = this.dict[`populationType`] as string;
        let populationSize: number;
        if (populationType === 'dynamic' || populationType === 'static') {
            populationSize = Object.keys(JSON.parse(Container.template)).length;
        } else {
            populationSize = this.dict['population-size'] as number;
        }
        const properties = new NeuroevolutionProperties(populationSize);

        const parentsPerSpecies = this.dict['parentsPerSpecies'] as number;
        const numberOfSpecies = this.dict['numberOfSpecies'] as number;
        const penalizingAge = this.dict['penalizingAge'] as number;
        const ageSignificance = this.dict['ageSignificance'] as number;
        const inputRate = this.dict['inputRate'] as number

        const crossoverWithoutMutation = this.dict['crossover']['crossoverWithoutMutation'] as number
        const interspeciesMating = this.dict['crossover']['interspeciesRate'] as number

        const mutationWithoutCrossover = this.dict['mutation']['mutationWithoutCrossover'] as number
        const mutationAddConnection = this.dict['mutation']['mutationAddConnection'] as number
        const recurrentConnection = this.dict['mutation']['recurrentConnection'] as number
        const addConnectionTries = this.dict['mutation']['addConnectionTries'] as number
        const populationChampionNumberOffspring = this.dict['mutation']['populationChampionNumberOffspring'] as number;
        const populationChampionNumberClones = this.dict['mutation']['populationChampionNumberClones'] as number;
        const populationChampionConnectionMutation = this.dict['mutation']['populationChampionConnectionMutation'] as number;
        const mutationAddNode = this.dict['mutation']['mutationAddNode'] as number;
        const mutateWeights = this.dict['mutation']['mutateWeights'] as number;
        const perturbationPower = this.dict['mutation']['perturbationPower'] as number;
        const mutateToggleEnableConnection = this.dict['mutation']['mutateToggleEnableConnection'] as number;
        const toggleEnableConnectionTimes = this.dict['mutation']['toggleEnableConnectionTimes'] as number;
        const mutateEnableConnection = this.dict['mutation']['mutateEnableConnection'] as number;

        const distanceThreshold = this.dict['compatibility']['distanceThreshold'] as number
        const disjointCoefficient = this.dict['compatibility']['disjointCoefficient'] as number
        const excessCoefficient = this.dict['compatibility']['excessCoefficient'] as number;
        const weightCoefficient = this.dict['compatibility']['weightCoefficient'] as number;

        const timeout = this.dict['network-fitness']['timeout'];

        properties.populationType = this.dict[`populationType`] as string;
        properties.eventSelection = this.dict[`eventSelection`] as string;
        properties.testSuiteType = this.getTestSuiteType();
        properties.testTemplate = Container.template;
        properties.numberOfSpecies = numberOfSpecies;
        properties.parentsPerSpecies = parentsPerSpecies;
        properties.penalizingAge = penalizingAge;
        properties.ageSignificance = ageSignificance;
        properties.inputRate = inputRate;

        properties.crossoverWithoutMutation = crossoverWithoutMutation;
        properties.interspeciesMating = interspeciesMating;

        properties.mutationWithoutCrossover = mutationWithoutCrossover;
        properties.mutationAddConnection = mutationAddConnection;
        properties.recurrentConnection = recurrentConnection;
        properties.addConnectionTries = addConnectionTries;
        properties.populationChampionNumberOffspring = populationChampionNumberOffspring;
        properties.populationChampionNumberClones = populationChampionNumberClones;
        properties.populationChampionConnectionMutation = populationChampionConnectionMutation;
        properties.mutationAddNode = mutationAddNode;
        properties.mutateWeights = mutateWeights;
        properties.perturbationPower = perturbationPower;
        properties.mutateToggleEnableConnection = mutateToggleEnableConnection;
        properties.toggleEnableConnectionTimes = toggleEnableConnectionTimes;
        properties.mutateEnableConnection = mutateEnableConnection;

        properties.distanceThreshold = distanceThreshold;
        properties.disjointCoefficient = disjointCoefficient;
        properties.excessCoefficient = excessCoefficient;
        properties.weightCoefficient = weightCoefficient;

        properties.timeout = timeout;

        properties.stoppingCondition = this._getStoppingCondition(this.dict['stopping-condition']);
        properties.networkFitness = this.getNetworkFitnessFunction(this.dict['network-fitness'])
        return properties;
    }

    private _getStoppingCondition(stoppingCondition: Record<string, any>): StoppingCondition<any> {
        const stoppingCond = stoppingCondition["type"];
        if (stoppingCond == "fixed-iteration") {
            return new FixedIterationsStoppingCondition(stoppingCondition["iterations"])
        } else if (stoppingCond == "fixed-time") {
            return new FixedTimeStoppingCondition(stoppingCondition["duration"]);
        } else if (stoppingCond == "optimal") {
            return new OptimalSolutionStoppingCondition()
        } else if (stoppingCond == 'events') {
            return new ExecutedEventsStoppingCondition(stoppingCondition['max-events']);
        } else if (stoppingCond == 'evaluations') {
            return new FitnessEvaluationStoppingCondition(stoppingCondition['max-evaluations']);
        } else if (stoppingCond == "one-of") {
            const conditions = stoppingCondition["conditions"];
            const l: StoppingCondition<any>[] = [];
            for (const c of conditions) {
                l.push(this._getStoppingCondition(c));
            }
            return new OneOfStoppingCondition(...l)
        }

        throw new ConfigException("No stopping condition given");
    }

    private _getMutationOperator(): Mutation<any> {
        switch (this.dict['mutation']['operator']) {
            case 'bitflip':
                return new BitflipMutation();
            case 'variablelength':
                return new VariableLengthMutation(this.dict['integerRange']['min'], this.dict['integerRange']['max'],
                    this.dict['chromosome-length'], this.dict['mutation']['gaussianMutationPower']);
            case 'variablelengthConstrained':
                return new VariableLengthConstrainedChromosomeMutation(this.dict['integerRange']['min'], this.dict['integerRange']['max'],
                    this.dict['chromosome-length'], this.dict['mutation']['gaussianMutationPower']);
            case 'biasedvariablelength': {
                const {
                    integerRange: {min, max},
                    [`chromosome-length`]: chromosomeLength,
                    mutation: {gaussianMutationPower}
                } = this.dict;
                return new BiasedVariableLengthMutation(min, max, chromosomeLength, gaussianMutationPower);
            }
            case 'biasedVariablelengthConstrained':
                return new BiasedVariableLengthConstrainedChromosomeMutation(this.dict['integerRange']['min'], this.dict['integerRange']['max'],
                    this.dict['chromosome-length'], this.dict['mutation']['gaussianMutationPower']);
            case'neatMutation':
                return new NeatMutation(this.dict['mutation'])
            case 'integerlist':
            default:
                return new IntegerListMutation(this.dict['integerRange']['min'], this.dict['integerRange']['max']);
        }
    }

    private _getCrossoverOperator(): Crossover<any> {
        switch (this.dict['crossover']['operator']) {
            case 'singlepointrelative':
                return new SinglePointRelativeCrossover();
            case 'neatCrossover':
                return new NeatCrossover(this.dict['crossover']);
            case 'singlepoint':
            default:
                return new SinglePointCrossover();
        }
    }

    public getSelectionOperator(): Selection<any> {
        switch (this.dict['selection']['operator']) {
            case 'tournament':
                return new TournamentSelection(this.dict['selection']['tournamentSize']) as unknown as Selection<any>;
            case 'rank':
            default:
                return new RankSelection();
        }
    }

    public getLocalSearchOperators(): List<LocalSearch<any>> {
        const operators = new List<LocalSearch<any>>();
        const localSearchOperators = this.dict['localSearch'];

        // If there are no local search operators defined return an empty list.
        if (!localSearchOperators) {
            return new List<LocalSearch<any>>();
        }

        // Otherwise add the defined local search operators
        for (const operator of localSearchOperators) {
            let type: LocalSearch<any>;
            switch (operator['type']) {
                case "Extension":
                    type = new ExtensionLocalSearch(Container.vmWrapper, this.getEventExtractor(),
                        this.getEventSelector(), operator['probability']);
                    break;
                case "Reduction":
                    type = new ReductionLocalSearch(Container.vmWrapper, this.getEventExtractor(),
                        this.getEventSelector(), operator['probability']);
            }

            operators.add(type);
        }
        return operators;
    }

    public getEventExtractor(): ScratchEventExtractor {
        switch (this.dict['extractor']) {
            case 'naive':
                return new NaiveScratchEventExtractor(Container.vm);
            case 'wait':
                return new JustWaitScratchEventExtractor(Container.vm);
            case 'static':
                return new StaticScratchEventExtractor(Container.vm);
            case 'neuroevolution':
                return new NeuroevolutionScratchEventExtractor(Container.vm);
            case 'dynamic':
            default:
                return new DynamicScratchEventExtractor(Container.vm);
        }
    }

    public getEventSelector(): EventSelector {
        switch (this.dict['eventSelector']) {
            case 'clustering': {
                const {integerRange} = this.dict;
                return new ClusteringEventSelector(integerRange);
            }
            case 'interleaving':
            default:
                return new InterleavingEventSelector();
        }
    }

    public getChromosomeGenerator(): ChromosomeGenerator<any> {
        // TODO: Temporary fix for strange EventExtractor failures
        let scratchEvents: List<ScratchEvent>;
        let doRetry = true;
        let retryCount = 0;
        while (doRetry) {
            try {
                scratchEvents = new NeuroevolutionScratchEventExtractor(Container.vm).extractEvents(Container.vm);
                doRetry = false;
            } catch (e) {
                if (retryCount > 5) {
                    doRetry = false;
                } else {
                    retryCount++
                    console.log(`Retrying to fetch Events for ${retryCount} time`)
                }
            }
        }
        if (!scratchEvents) {
            console.log("Was not able to fetch scratchEvents ... creating set with WaitEvent only")
            scratchEvents = new List<ScratchEvent>();
            scratchEvents.add(new WaitEvent());
        }
        switch (this.dict['chromosome']) {
            case 'bitstring':
                return new BitstringChromosomeGenerator(this.getSearchAlgorithmProperties(),
                    this._getMutationOperator(),
                    this._getCrossoverOperator());
            case 'integerlist':
                return new IntegerListChromosomeGenerator(this.getSearchAlgorithmProperties(),
                    this._getMutationOperator(),
                    this._getCrossoverOperator());
            case 'variablelengthtest':
                return new VariableLengthTestChromosomeGenerator(this.getSearchAlgorithmProperties(),
                    this._getMutationOperator(),
                    this._getCrossoverOperator(),
                    this.dict['minVarChromosomeLength'],
                    this.dict['maxVarChromosomeLength']);
            case 'sparseNetwork': {
                return new NetworkChromosomeGeneratorSparse(this.dict['mutation'], this.dict['crossover'],
                    InputExtraction.extractSpriteInfo(Container.vmWrapper), scratchEvents,
                    this.dict['inputRate']);
            }
            case 'fullyConnectedNetwork': {
                return new NetworkChromosomeGeneratorFullyConnected(this.dict['mutation'], this.dict['crossover'],
                    InputExtraction.extractSpriteInfo(Container.vmWrapper), scratchEvents);
            }
            case 'templateNetwork': {
                const eventExtractor = new NeuroevolutionScratchEventExtractor(Container.vm);
                return new NetworkChromosomeGeneratorTemplateNetwork(this.dict['mutation'], this.dict['crossover'],
                    Container.template, eventExtractor.extractEvents(Container.vm));
            }
            case 'test':
            default:
                return new TestChromosomeGenerator(this.getSearchAlgorithmProperties(),
                    this._getMutationOperator(),
                    this._getCrossoverOperator());
        }
    }

    public getFitnessFunctionType(): FitnessFunctionType {
        const fitnessFunctionDef = this.dict['fitness-function'];
        switch (fitnessFunctionDef["type"]) {
            case 'statement':
                return FitnessFunctionType.STATEMENT;
            case 'one-max':
                return FitnessFunctionType.ONE_MAX;
            case 'single-bit':
            default:
                return FitnessFunctionType.SINGLE_BIT;
        }
    }

    public getNetworkFitnessFunction(fitnessFunction: Record<string, any>): NetworkFitnessFunction<NetworkChromosome> {
        const networkFitnessDef = fitnessFunction['type'];
        if (networkFitnessDef === 'score')
            return new ScoreFitness();
        else if (networkFitnessDef === 'statement')
            return new StatementNetworkFitness();
        else if (networkFitnessDef === 'survive')
            return new SurviveFitness();
        else if (networkFitnessDef === 'target')
            return new TargetFitness(fitnessFunction['player'], fitnessFunction['target'],
                fitnessFunction['colorObstacles'], fitnessFunction['spriteObstacles']);
        else if (networkFitnessDef === 'novelty') {
            return new NoveltyTargetNetworkFitness(fitnessFunction['player'], fitnessFunction['neighbourCount'],
                fitnessFunction['archiveThreshold']);
        } else if (networkFitnessDef === 'combined') {
            const fitnessFunctions = fitnessFunction["functions"];
            const comb: NetworkFitnessFunction<NetworkChromosome>[] = [];
            for (const functions of fitnessFunctions) {
                comb.push(this.getNetworkFitnessFunction(functions));
            }
            return new CombinedNetworkFitness(...comb)
        }
        throw new ConfigException("No Network Fitness specified in the config file!")
    }


    public getFitnessFunctionTargets(): List<string> {
        const fitnessFunctionDef = this.dict['fitness-function'];
        if (fitnessFunctionDef['targets']) {
            const targets = new List<string>();
            for (const target of fitnessFunctionDef['targets']) {
                targets.add(target)
            }
            return targets;
        } else {
            return new List();
        }
    }

    public getAlgorithm(): SearchAlgorithmType {
        switch (this.dict['algorithm']) {
            case 'random':
                return SearchAlgorithmType.RANDOM;
            case 'one-plus-one':
                return SearchAlgorithmType.ONE_PLUS_ONE;
            case 'simplega':
                return SearchAlgorithmType.SIMPLEGA;
            case 'mosa':
                return SearchAlgorithmType.MOSA;
            case 'mio':
                return SearchAlgorithmType.MIO;
            case'neat':
                return SearchAlgorithmType.NEAT;
            default:
                throw new IllegalArgumentException("Invalid configuration. Unknown algorithm: " + this.dict['algorithm']);
        }
    }

    public getTestGenerator(): TestGenerator {
        if (this.dict["test-generator"] == "random") {
            return new RandomTestGenerator(this, this.dict['minEventSize'], this.dict['maxEventSize']);
        } else if (this.dict['test-generator'] == 'iterative') {
            return new IterativeSearchBasedTestGenerator(this);
        } else if (this.dict['test-generator'] == 'many-objective') {
            return new ManyObjectiveTestGenerator(this);
        } else if (this.dict['test-generator'] == 'neuroevolution') {
            Container.isNeuroevolution = true;
            return new NeuroevolutionTestGenerator(this);
        }

        throw new ConfigException("Unknown Algorithm " + this.dict["test-generator"]);
    }

    public getWaitStepUpperBound(): number {
        if ("waitStepUpperBound" in this.dict) {
            return this.dict["waitStepUpperBound"]
        } else {
            return 200;
        }
    }

    public getPressDurationUpperBound(): number {
        if ("pressDurationUpperBound" in this.dict) {
            return this.dict["pressDurationUpperBound"]
        } else {
            return 50;
        }
    }

    public getClickDuration(): number {
        if ("click-duration" in this.dict) {
            return this.dict["click-duration"]
        } else {
            return 10;
        }
    }

    public getRandomSeed(): number {
        if ("seed" in this.dict && typeof this.dict["seed"] === "number") {
            return this.dict["seed"];
        } else {
            return Date.now();
        }
    }

    public getTestSuiteType(): string {
        if("testSuiteType" in this.dict){
           return this.dict['testSuiteType'];
        }
        else{
            return "dynamic"
        }
    }
}
