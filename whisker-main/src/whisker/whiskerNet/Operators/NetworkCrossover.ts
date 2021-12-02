import {Crossover} from "../../search/Crossover";
import {NetworkChromosome} from "../Networks/NetworkChromosome";
import {Pair} from "../../utils/Pair";

export abstract class NetworkCrossover<C extends NetworkChromosome> extends Crossover<NetworkChromosome> {

    /**
     * Applies crossover to the two given parent chromosomes
     * and returns the resulting pair of chromosomes.
     * @param parent1 the first parent
     * @param parent2 the second parent
     * @returns the offspring formed by applying crossover to the given parents
     */
    abstract apply(parent1: C, parent2: C): Pair<C>;
}
