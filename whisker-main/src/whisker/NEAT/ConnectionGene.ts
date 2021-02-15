/**
 * A ConnectionGene represents the connections of a neural network
 */
import {NodeGene} from "./NodeGene";
import {NeatConfig} from "./NeatConfig";

export class ConnectionGene {
    private _from: NodeGene;
    private _to: NodeGene;
    private _weight: number;
    private _enabled: boolean;
    private _innovation;
    private static innovationCounter = (NeatConfig.INPUT_NEURONS + 1) * NeatConfig.OUTPUT_NEURONS; // +1 for Bias-Node

    constructor(from: NodeGene, to: NodeGene, weight: number, enabled: boolean, innovation: number) {
        this._from = from;
        this._to = to;
        this._weight = weight;
        this._enabled = enabled;
        this._innovation = innovation;
    }

    public copy(): ConnectionGene {
        return new ConnectionGene(this.from.clone(), this.to.clone(), this.weight, this.enabled, this.innovation)
    }

    get from(): NodeGene {
        return this._from;
    }

    set from(value: NodeGene) {
        this._from = value;
    }

    get to(): NodeGene {
        return this._to;
    }

    set to(value: NodeGene) {
        this._to = value;
    }

    get weight(): number {
        return this._weight;
    }

    set weight(value: number) {
        this._weight = value;
    }

    get enabled(): boolean {
        return this._enabled;
    }

    set enabled(value: boolean) {
        this._enabled = value;
    }

    get innovation(): number {
        return this._innovation;
    }

    set innovation(innovation: number) {
        this._innovation = innovation;
    }

    static getNextInnovationNumber(): number {
        return ++ConnectionGene.innovationCounter;
    }

    static resetInnovationCounter(): void {
        ConnectionGene.innovationCounter = (NeatConfig.INPUT_NEURONS + 1) * NeatConfig.OUTPUT_NEURONS;
    }

    /**
     * Check equality by comparing both the in and output Nodes
     * @param other the other Gene to compare this ConnectionGene to
     */
    public equalsByNodes(other: unknown): boolean {
        if (!(other instanceof ConnectionGene)) return false;
        return this.from.equals(other.from) && this.to.equals(other.to);
    }

    /**
     * Check equality by the in and output nodes AND additionally the innovation number
     * @param other the other Gene to compare this ConnectionGene to
     */
    public equalsByInnovation(other: unknown): boolean {
        if (!(other instanceof ConnectionGene)) return false;
        return this.equalsByNodes(other) && this.innovation === other.innovation;
    }

    toString(): string {
        return " ConnectionGene{FromId: " + this.from.id + ", ToId: " + this.to.id + ", Weight: " + this.weight +
            ", Enabled: " + this.enabled + ", InnovationNumber: " + this.innovation + "}"
    }
}
