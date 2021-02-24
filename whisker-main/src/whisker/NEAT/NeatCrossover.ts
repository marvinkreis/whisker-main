import {Crossover} from "../search/Crossover";
import {NeatChromosome} from "./NeatChromosome";
import {Pair} from "../utils/Pair";
import {ConnectionGene} from "./ConnectionGene";
import {List} from "../utils/List";


export class NeatCrossover implements Crossover<NeatChromosome> {

    apply(parent1: NeatChromosome, parent2: NeatChromosome): Pair<NeatChromosome> {
        parent1.generateNetwork();
        parent2.generateNetwork();
        // Triangle-Swap to have the fittest chromosome always as parent1
        if (parent1.nonAdjustedFitness < parent2.nonAdjustedFitness) {
            const temp = parent1;
            parent1 = parent2;
            parent2 = temp;
        }

        // Save first connections in a Map <InnovationNumber, Connection>
        const parent1Innovations = new Map<number, ConnectionGene>()
        for (const connection of parent1.connections) {
            parent1Innovations.set(connection.innovation, connection)
        }

        // Save second connections in a Map <InnovationNumber, Connection>
        const parent2Innovations = new Map<number, ConnectionGene>()
        for (const connection of parent2.connections) {
            parent2Innovations.set(connection.innovation, connection)
        }

        // Save in a set to remove duplicates
        let allInnovations = new Set<number>(parent1Innovations.keys());
        parent2Innovations.forEach((value, key) => allInnovations.add(key))
        allInnovations = new Set([...allInnovations].sort());

        // Decide for each element in the Set how the connection corresponding to the innovation Number
        // should be added to the child's connection List
        const newConnections = new List<ConnectionGene>();
        for (const innovationNumber of allInnovations) {

            // Matching connections are inherited randomly
            if (parent1Innovations.has(innovationNumber) && parent2Innovations.has(innovationNumber)) {
                Math.random() <= 0.5 ? newConnections.add(parent1Innovations.get(innovationNumber)) :
                    newConnections.add(parent2Innovations.get(innovationNumber))
            }
            // Disjoint or Excess genes are inherited from the more fit Chromosome => Here always parent1
            else if (parent1.fitness > parent2.fitness) {
                if (parent1Innovations.has(innovationNumber)) newConnections.add(parent1Innovations.get(innovationNumber))
            }
            // Connections are Disjoint or Excess AND the fitness of both Chromosomes is the same => Choose randomly
            else {
                if (Math.random() <= 0.5) {
                    if (parent1Innovations.has(innovationNumber))
                        newConnections.add(parent1Innovations.get(innovationNumber))
                } else {
                    if (parent2Innovations.has(innovationNumber))
                        newConnections.add(parent2Innovations.get(innovationNumber))
                }
            }
        }
        newConnections.sort((a, b) => a.innovation - b.innovation)
        let child = parent1.cloneWith(newConnections);

        //Check the network if by chance we destroyed the network return the fittest parent
        child.generateNetwork();
        const testInput = [];
        for (let i = 0; i < child.inputNodes.size(); i++) {
            testInput.push(i);
        }
        if(child.connections.size() === 0){
            console.error("Crossover Undefined Network")
            child = parent1.clone();
        }
        // In Neat only one offspring is created in crossover => ignore second part of the pair
        return new Pair<NeatChromosome>(child, null);
    }

    applyFromPair(parents: Pair<NeatChromosome>): Pair<NeatChromosome> {
        return this.apply(parents.getFirst(), parents.getSecond());
    }

}
