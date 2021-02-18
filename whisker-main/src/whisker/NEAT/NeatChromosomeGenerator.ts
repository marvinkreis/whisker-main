import {ChromosomeGenerator} from "../search/ChromosomeGenerator";
import {NeatChromosome} from "./NeatChromosome";
import {Mutation} from "../search/Mutation";
import {Crossover} from "../search/Crossover";
import {List} from "../utils/List";
import {NodeGene} from "./NodeGene";
import {NodeType} from "./NodeType";
import {ConnectionGene} from "./ConnectionGene";
import {NeatConfig} from "./NeatConfig";
import {NeatCrossover} from "./NeatCrossover";
import {NeatMutation} from "./NeatMutation";

export class NeatChromosomeGenerator implements ChromosomeGenerator<NeatChromosome> {


    private _mutationOp: Mutation<NeatChromosome>;

    private _crossoverOp: Crossover<NeatChromosome>;

    private _inputSize: number;

    private _outputSize: number;

    constructor(mutationOp: Mutation<NeatChromosome>, crossoverOp: Crossover<NeatChromosome>, numInputNodes: number,
                numOutputNodes: number) {
        this._mutationOp = mutationOp;
        this._crossoverOp = crossoverOp;
        this.inputSize = numInputNodes;
        this.outputSize = numOutputNodes;
    }

    /**
     * Creates and returns a random NeatChromosome with the specified number of input and output nodes and a random set
     * of connections in between them.
     * @ returns: A random initial Neat Phenotype
     */
    get(): NeatChromosome {
        NodeGene._idCounter = 0;
        // Create the Input Nodes and add them to the nodes list
        const inputList = new List<NodeGene>()
        for (let i = 0; i < this._inputSize; i++) {
            inputList.add(new NodeGene(i, NodeType.INPUT))
        }
        inputList.add(new NodeGene(inputList.size(), NodeType.BIAS))    // Bias

        // Create the Output Nodes and add them to the nodes list
        const outputList = new List<NodeGene>()
        for (let i = 0; i < this._outputSize; i++) {
            outputList.add(new NodeGene(inputList.size() + i, NodeType.OUTPUT))
        }


        const neatChromosome = NeatChromosomeGenerator.createConnections(inputList, outputList);
        neatChromosome.fitness = 0;
        return neatChromosome;
    }

    static createConnections(inputNodes:List<NodeGene>, outputNodes:List<NodeGene>) : NeatChromosome{
        const connections = new List<ConnectionGene>();
        let counter = 1;
        for (const inputNode of inputNodes) {
            for (const outputNode of outputNodes) {
                // Do not connect the Bias Node
                if (inputNode.type !== NodeType.BIAS) {
                    connections.add(new ConnectionGene(inputNode, outputNode, Math.random(), Math.random() < 0.6, counter))
                    counter++;
                }
            }
        }
        const neatChromosome = new NeatChromosome(connections, inputNodes, outputNodes, new NeatCrossover(), new NeatMutation());
        neatChromosome.fitness = 0;
        return neatChromosome;
    }

    setCrossoverOperator(crossoverOp: Crossover<NeatChromosome>): void {
        this._crossoverOp = crossoverOp;
    }

    setMutationOperator(mutationOp: Mutation<NeatChromosome>): void {
        this._mutationOp = mutationOp;
    }


    // Used for Testing
    set inputSize(value: number) {
        this._inputSize = value;
    }

    get inputSize(): number {
        return this._inputSize;
    }

    // Used for Testing
    set outputSize(value: number) {
        this._outputSize = value;
    }

    get outputSize(): number {
        return this._outputSize;
    }
}
