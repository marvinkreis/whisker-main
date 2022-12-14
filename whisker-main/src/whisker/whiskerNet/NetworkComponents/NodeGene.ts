import {ConnectionGene} from "./ConnectionGene";
import {ActivationFunction} from "./ActivationFunction";
import {NodeType} from "./NodeType";
import {NeatPopulation} from "../NeuroevolutionPopulations/NeatPopulation";

export abstract class NodeGene {

    /**
     * Counter used for assigning the unique identifier.
     */
    public static _uIDCounter = 0;

    /**
     * The unique identifier of a node.
     */
    private readonly _uID: number

    /**
     * The value of a node, which is defined to be the sum of all incoming connections.
     */
    private _nodeValue = 0;

    /**
     * The activation function of this node.
     */
    private readonly _activationFunction: number

    /**
     * Activation value of a node.
     */
    private _activationValue = 0;

    /**
     * Activation value of the previous time step.
     */
    private _lastActivationValue = 0;

    /**
     * Counts how often this node has been activated.
     */
    private _activationCount = 0;

    /**
     * True if the node has been activated at least once within one network activation.
     */
    private _activatedFlag = false;

    /**
     * Holds all incoming connections.
     */
    private _incomingConnections: ConnectionGene[] = [];

    /**
     * True if this node has been traversed.
     */
    private _traversed = false;

    /**
     * The type of the node (Input | Bias | Hidden | Output).
     */
    private readonly _type: NodeType

    /**
     * Creates a new node.
     * @param uID the unique identifier of this node in the network.
     * @param activationFunction the activation function of the node
     * @param type the type of the node (Input | Hidden | Output)
     */
    protected constructor(uID: number, activationFunction: ActivationFunction, type: NodeType) {
        this._uID = uID;
        this._activationFunction = activationFunction;
        this._type = type;
        if (NeatPopulation.highestNodeId < this.uID) {
            NeatPopulation.highestNodeId = this.uID;
        }
    }

    /**
     * Calculates the activation value of the node based on the node value and the activation function.
     * @returns number activation value of the given node.
     */
    public abstract activate(): number

    /**
     * Resets the node's attributes.
     */
    public reset(): void {
        this.activationCount = 0;
        this.activationValue = 0;
        this.nodeValue = 0;
        this.lastActivationValue = 0;
        this.activatedFlag = false;
        this.traversed = false;
    }

    /**
     * Deep equality function. Generally two nodes are equal if they represent the same entity, e.g. for input nodes
     * the same input feature.
     * @param other the node to compare this node to.
     * @returns true iff both nodes are equal.
     */
    public abstract equals(other: unknown): boolean

    /**
     * Clones the given node
     * @returns clone of this node.
     */
    public abstract clone(): NodeGene

    /**
     * Assigns a string identifier to the node. This identifier is different from the uID in the sense that it
     * includes the node type and other crucial attributes. Therefore, we can identify some node types with equal
     * purposes across networks, regardless of their assigned uID which is primarily dependent on the time of
     * occurrence.
     * @returns identifier including the node type and its most important attributes.
     */
    public abstract identifier(): string;

    public abstract toString(): string

    public abstract toJSON(): Record<string, (number | string)>;

    get uID(): number {
        return this._uID;
    }

    get nodeValue(): number {
        return this._nodeValue;
    }

    set nodeValue(value: number) {
        this._nodeValue = value;
    }

    get activationValue(): number {
        return this._activationValue;
    }

    set activationValue(value: number) {
        this._activationValue = value;
    }

    get activationCount(): number {
        return this._activationCount;
    }

    set activationCount(value: number) {
        this._activationCount = value;
    }

    get activatedFlag(): boolean {
        return this._activatedFlag;
    }

    set activatedFlag(value: boolean) {
        this._activatedFlag = value;
    }

    get incomingConnections(): ConnectionGene[] {
        return this._incomingConnections;
    }

    set incomingConnections(value: ConnectionGene[]) {
        this._incomingConnections = value;
    }

    get activationFunction(): number {
        return this._activationFunction;
    }

    get lastActivationValue(): number {
        return this._lastActivationValue;
    }

    set lastActivationValue(value: number) {
        this._lastActivationValue = value;
    }

    get traversed(): boolean {
        return this._traversed;
    }

    set traversed(value: boolean) {
        this._traversed = value;
    }

    get type(): NodeType {
        return this._type;
    }
}
