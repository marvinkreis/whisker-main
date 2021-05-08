import {ModelNode} from "./ModelNode";
import {ModelEdge} from "./ModelEdge";
import TestDriver from "../../../test/test-driver";
import {ConditionState} from "../util/ConditionState";
import {ModelResult} from "../../../test-runner/test-result";

const EFFECT_LEEWAY = 1;

/**
 * Graph structure for a program model representing the program behaviour of a Scratch program.
 *
 *
 * (later also an user model representing the user behaviour when using the Scratch program ??)
 *
 * ############# Assumptions ##################
 * - Only one start node, unique
 * - Not every program model needs to have a stop node. (but one of the program nodes has one)
 * - Each edge has a condition (input event, condition for a variable,....) -> or at least an always true condition
 * - Effects can also occur at a later VM step, therefore its tested 3 successive steps long for occurrence.
 */
export class ProgramModel {

    readonly id: string;
    private readonly startNode: ModelNode;
    currentState: ModelNode;

    private readonly stopNodes: { [key: string]: ModelNode };
    private readonly nodes: { [key: string]: ModelNode };
    private readonly edges: { [key: string]: ModelEdge };

    private effectsToCheck: ModelEdge[]; // edge with the failed effects

    private waitingFunction: () => boolean = undefined;

    /**
     * Construct a model (graph) with a string identifier and model type (program or user model). Sets up the start
     * node and stopping nodes for simulating transitions on the graph.
     *
     * @param id ID of the model.
     * @param startNode Start node for traversing the graph.
     * @param stopNodes Nodes stopping the graph walkthrough.
     * @param nodes Dictionary mapping the node ids to the actual nodes in the graph.
     * @param edges Dictionary mapping the edge ids to the actual edges in the graph.
     */
    constructor(id: string, startNode: ModelNode, stopNodes: { [key: string]: ModelNode },
                nodes: { [key: string]: ModelNode }, edges: { [key: string]: ModelEdge }) {
        this.id = id;
        this.currentState = startNode;
        this.startNode = startNode;
        this.stopNodes = stopNodes;
        this.nodes = nodes;
        this.edges = edges;
    }

    /**
     * Simulate transitions on the graph. Edges are tested only once if they are reached.
     */
    makeTransitions(testDriver: TestDriver, modelResult: ModelResult): ModelEdge[] {
        // wait effect
        if (this.waitingFunction) {
            if (!this.waitingFunction()) {
                // still waiting
                return [];
            } else {
                this.waitingFunction = undefined;
            }
        }

        let transitions = [];
        // console.log("model step " + this.id, testDriver.getTotalStepsExecuted())

        while (true) {
            // ask the current node for a valid transition
            let edge = this.currentState.testEdgeConditions(testDriver, modelResult);

            if (!edge) {
                break;
            }

            transitions.push(edge);
            this.effectsToCheck.push(edge);
            if (this.currentState != edge.getEndNode()) {
                this.currentState = edge.getEndNode();
            } else {
                break;
            }
        }
        return transitions;
    }

    waitEffectStart(waitCheck) {
        this.waitingFunction = waitCheck
    }

    /**
     * The models stops when a stop node is reached.
     */
    stopped() {
        return this.currentState.isStopNode;
    }

    /**
     * Reset the graph to the start state.
     */
    reset(): void {
        this.currentState = this.startNode;
        this.effectsToCheck = [];
        Object.values(this.nodes).forEach(node => {
            node.reset()
        });
    }

    /**
     * Check existences of sprites, existences of variables and ranges of arguments.
     * @param testDriver Instance of the test driver.
     */
    testModel(testDriver: TestDriver) {
        try {
            Object.values(this.nodes).forEach(node => {
                node.testEdgesForErrors(testDriver);
            })
        } catch (e) {
            throw new Error("Errors on Model '" + this.id + "':\n" + e.message);
        }
    }

    /**
     * Register the condition state.
     */
    registerConditionState(conditionState: ConditionState) {
        Object.values(this.nodes).forEach(node => {
            node.registerConditionState(conditionState);
        })
    }

    /**
     * Check the effects that are still missing.
     * Edges are taken when conditions are met, that means e.g. a key was active. The effect of the edge is tested
     * in the same step the condition was tested. If it fails, it is again tested the next three steps. If it is
     * only late it then accepts. While it tests these three steps other edges can be taken. Their effects are also
     * tested. After the three steps the effect is reported as missing.
     *
     * If the effect is missing and tested for in the next three steps and another edge with the same effect is
     * taken, the effect has to be fulfilled in two different steps. Therefore, dont test the same effect in the same
     * step twice (in effect solved). The old edge missing the effect is preferred in the check if the effect is
     * fulfilled.
     */
    checkEffects(testDriver: TestDriver, modelResult: ModelResult) {
        if (this.effectsToCheck.length == 0) {
            return;
        }

        let newEffectsToCheck = [];
        for (let i = 0; i < this.effectsToCheck.length; i++) {
            if (!this.effectsToCheck[i].checkEffects(testDriver, modelResult, this)) {
                newEffectsToCheck.push(this.effectsToCheck[i]);
            }
        }
        this.effectsToCheck = newEffectsToCheck;
        if (this.effectsToCheck.length == 0) {
            return;
        }

        // if it failed more than once
        if (this.effectsToCheck[0].numberOfEffectFailures > EFFECT_LEEWAY) {
            // make a wonderful output
            let failedEdge = this.effectsToCheck[0];
            let output = "Effects:";
            for (let i = 0; i < failedEdge.failedEffects.length; i++) {
                output = output + " [" + i + "]" + failedEdge.failedEffects[i].toString();
            }

            output = "Effect failed. Edge: '" + failedEdge.id + "'. " + output;

            // remove it to not check again
            this.effectsToCheck = this.effectsToCheck.splice(1, this.effectsToCheck.length);
            throw new Error(output);
        }
    }
}
