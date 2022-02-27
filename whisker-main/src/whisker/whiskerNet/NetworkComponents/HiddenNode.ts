import {NodeGene} from "./NodeGene";
import {ActivationFunction} from "./ActivationFunction";
import {NodeType} from "./NodeType";
import {NeuroevolutionUtil} from "../NeuroevolutionUtil";

export class HiddenNode extends NodeGene {

    /**
     * Constructs a new HiddenNode.
     * @param activationFunction the activation function used within this node gene.
     * @param incrementIDCounter flag determining whether the uID counter should be increased after constructing a
     * new hidden node.
     */
    constructor(activationFunction: ActivationFunction, incrementIDCounter = true) {
        super(activationFunction, NodeType.HIDDEN, incrementIDCounter);
    }

    depth(d: number): number {
        let cur_depth: number //The depth of the current node
        let max = d; //The max depth

        // Recurrency
        if (d > 100) {
            return 10;
        }
        for (const connection of this.incomingConnections) {
            const inNode = connection.source;
            cur_depth = inNode.depth(d + 1);
            if (cur_depth > max) {
                max = cur_depth;
            }
        }

        return max;
    }

    equals(other: unknown): boolean {
        if (!(other instanceof HiddenNode)) return false;
        return this.uID === other.uID && this.activationFunction === other.activationFunction;
    }

    clone(): HiddenNode {
        const clone = new HiddenNode(this.activationFunction, false);
        clone.uID = this.uID;
        clone.nodeValue = this.nodeValue;
        clone.activationValue = this.activationValue;
        clone.lastActivationValue = this.lastActivationValue;
        clone.activationCount = this.activationCount;
        clone.activatedFlag = this.activatedFlag;
        clone.traversed = this.traversed;
        return clone
    }

    /**
     * Calculates the activation value of the hidden node based on the node value and the activation function.
     * @returns number activation value of the hidden node.
     */
    activate(): number {
        if (this.activatedFlag) {
            switch (this.activationFunction) {
                case ActivationFunction.SIGMOID:
                    this.activationValue = NeuroevolutionUtil.sigmoid(this.nodeValue, -4.9);
                    break;
                default:
                    this.activationValue = this.nodeValue;
                    break;
            }
            return this.activationValue;
        } else
            return 0.0;
    }

    public identifier(): string{
        return `H:${this.uID}`
    }

    toString(): string {
        return `HiddenNode{ID: ${this.uID}\
, Value: ${this.activationValue}\
, InputConnections: ${this.incomingConnections}}`;
    }

    public toJSON(): Record<string, (number | string)> {
        const node = {}
        node[`id`] = this.uID;
        node[`t`] = "H";
        node[`aF`] = ActivationFunction[this.activationFunction];
        return node;
    }

}
