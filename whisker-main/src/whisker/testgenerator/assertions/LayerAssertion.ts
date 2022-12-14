import {js, WhiskerAssertion} from "./WhiskerAssertion";
import {AssertionFactory} from "./AssertionFactory";
import RenderedTarget from "scratch-vm/@types/scratch-vm/sprites/rendered-target";

export class LayerAssertion extends WhiskerAssertion {

    private readonly _layer: number;

    constructor (target: RenderedTarget, layer: number, cloneIndex?: number) {
        super(target, cloneIndex);
        this._layer = layer;
    }

    evaluate(state: Map<string, Map<string, any>>): boolean {
        for (const targetState of Object.values(state)) {
            if (targetState.target === this._target) {
                return targetState.layer == this._layer;
            }
        }

        return false;
    }

    toString(): string {
        return `assert ${this.getTargetName()} has layer ${this._layer}`;
    }
    toJavaScript(): string {
        if (this._target.isOriginal) {
            return js`t.assert.equal(${this.getTargetAccessor()}.layerOrder, ${this._layer}, "Expected ${this.getTargetName()} to be at layer ${this._layer}");`;
        } else {
            return js`t.assert.equal(${this.getTargetAccessor()}.getLayerOrder(), ${this._layer}, "Expected ${this.getTargetName()} to be at layer ${this._layer}");`;
        }
    }

    static createFactory() : AssertionFactory<LayerAssertion>{
        return new (class implements AssertionFactory<LayerAssertion> {
            createAssertions(state: Map<string, Record<string, any>>): LayerAssertion[] {
                const assertions = [];
                for (const targetState of state.values()) {
                    if (targetState.target.isStage) {
                        continue;
                    }
                    assertions.push(new LayerAssertion(targetState.target, targetState.layer, targetState.cloneIndex));
                }

                return assertions;
            }
        })();
    }
}
