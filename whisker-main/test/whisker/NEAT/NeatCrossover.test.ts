import {NeatChromosome} from "../../../src/whisker/NEAT/NeatChromosome";
import {NeatMutation} from "../../../src/whisker/NEAT/NeatMutation";
import {NeatCrossover} from "../../../src/whisker/NEAT/NeatCrossover";
import {List} from "../../../src/whisker/utils/List";
import {ConnectionGene} from "../../../src/whisker/NEAT/ConnectionGene";
import {NodeGene} from "../../../src/whisker/NEAT/NodeGene";
import {NodeType} from "../../../src/whisker/NEAT/NodeType";
import {Pair} from "../../../src/whisker/utils/Pair";
import {ActivationFunctions} from "../../../src/whisker/NEAT/ActivationFunctions";

describe("NeatCrossover", () => {

    let mutationOp: NeatMutation;
    let crossoverOp: NeatCrossover;
    let parent1Connections: List<ConnectionGene>
    let parent2Connections: List<ConnectionGene>
    let inputNodes1: List<NodeGene>
    let outputNodes1: List<NodeGene>
    let inputNodes2: List<NodeGene>
    let outputNodes2: List<NodeGene>

    beforeEach(() => {
        mutationOp = new NeatMutation();
        crossoverOp = new NeatCrossover();

        // Create Nodes of first network
        const iNode1 = new NodeGene(0, NodeType.INPUT, ActivationFunctions.NONE)
        const iNode2 = new NodeGene(1, NodeType.INPUT, ActivationFunctions.NONE)
        const iNode3 = new NodeGene(2, NodeType.BIAS, ActivationFunctions.NONE)
        inputNodes1 = new List<NodeGene>();
        inputNodes1.add(iNode1)
        inputNodes1.add(iNode2)
        inputNodes1.add(iNode3)

        outputNodes1 = new List<NodeGene>();
        const oNode1 = new NodeGene(4, NodeType.OUTPUT, ActivationFunctions.NONE)
        outputNodes1.add(oNode1)
        const hiddenNode1 = new NodeGene(3, NodeType.HIDDEN, ActivationFunctions.SIGMOID)


        // Create Connections of first parent
        parent1Connections = new List<ConnectionGene>();
        parent1Connections.add(new ConnectionGene(iNode1, hiddenNode1, 1, true, 1));
        parent1Connections.add(new ConnectionGene(iNode2, hiddenNode1, 2, true, 2));
        parent1Connections.add(new ConnectionGene(iNode2, oNode1, 3, false, 4));
        parent1Connections.add(new ConnectionGene(iNode3, oNode1, 4, true, 5));
        parent1Connections.add(new ConnectionGene(hiddenNode1, oNode1, 5, true, 6));

        // Create Nodes of second network

        const iNode4 = iNode1.clone()
        const iNode5 = iNode2.clone()
        const iNode6 = iNode3.clone()
        inputNodes2 = new List<NodeGene>();
        inputNodes2.add(iNode4)
        inputNodes2.add(iNode5)
        inputNodes2.add(iNode6)

        const oNode2 = oNode1.clone()
        outputNodes2 = new List<NodeGene>();
        outputNodes2.add(oNode2)


        const hiddenNode2 = hiddenNode1.clone()
        const hiddenNode3 = new NodeGene(5, NodeType.HIDDEN, ActivationFunctions.SIGMOID)


        // Create Connections of second parent
        parent2Connections = new List<ConnectionGene>();
        parent2Connections.add(new ConnectionGene(iNode4, hiddenNode2, 6, false, 1));
        parent2Connections.add(new ConnectionGene(iNode5, hiddenNode2, 7, true, 2));
        parent2Connections.add(new ConnectionGene(iNode6, hiddenNode2, 8, true, 3));
        parent2Connections.add(new ConnectionGene(iNode5, oNode2, 9, false, 4));
        parent2Connections.add(new ConnectionGene(hiddenNode2, oNode2, 10, true, 6));
        parent2Connections.add(new ConnectionGene(iNode4, hiddenNode3, 11, true, 7));
        parent2Connections.add(new ConnectionGene(hiddenNode3, hiddenNode2, 12, true, 8));
    })


    test("CrossoverTest with first parent being fitter than second parent", () => {
        const parent1 = new NeatChromosome(parent1Connections, inputNodes1, outputNodes1, crossoverOp, mutationOp)
        parent1.fitness = 1;
        const parent2 = new NeatChromosome(parent2Connections, inputNodes2, outputNodes2, crossoverOp, mutationOp)
        parent2.fitness = 0;
        const child1 = crossoverOp.apply(parent1, parent2).getFirst()
        const child2 = crossoverOp.applyFromPair(new Pair<NeatChromosome>(parent1, parent2)).getFirst()
        expect(child1.connections.size()).toBe(5)
        expect(child1.connections.size()).toEqual(child2.connections.size())
    })

    test("CrossoverTest with second parent being fitter than first parent", () => {
        const parent1 = new NeatChromosome(parent1Connections, inputNodes1, outputNodes1, crossoverOp, mutationOp)
        parent1.nonAdjustedFitness = 0;
        const parent2 = new NeatChromosome(parent2Connections, inputNodes2, outputNodes2, crossoverOp, mutationOp)
        parent2.nonAdjustedFitness = 1;
        const child1 = crossoverOp.apply(parent1, parent2).getFirst()
        const child2 = crossoverOp.applyFromPair(new Pair<NeatChromosome>(parent1, parent2)).getFirst()
        expect(child1.connections.size()).toBe(7)
        expect(child2.connections.size()).toEqual(child1.connections.size())
    })

    test("CrossoverTest with both parents being equivalently fit", () => {
        const parent1 = new NeatChromosome(parent1Connections, inputNodes1, outputNodes1, crossoverOp, mutationOp)
        parent1.fitness = 1;
        const parent2 = new NeatChromosome(parent2Connections, inputNodes2, outputNodes2, crossoverOp, mutationOp)
        parent2.fitness = 1;
        const child1 = crossoverOp.apply(parent1, parent2).getFirst()
        const child2 = crossoverOp.applyFromPair(new Pair<NeatChromosome>(parent1, parent2)).getFirst()
        expect(child1.connections.size()).toBeGreaterThanOrEqual(4)
        expect(child2.connections.size()).toBeGreaterThanOrEqual(4)
    })
})
