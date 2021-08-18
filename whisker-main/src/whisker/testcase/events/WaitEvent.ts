/*
 * Copyright (C) 2020 Whisker contributors
 *
 * This file is part of the Whisker test generator for Scratch.
 *
 * Whisker is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Whisker is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Whisker. If not, see http://www.gnu.org/licenses/.
 *
 */

import {ScratchEvent} from "./ScratchEvent";
import {Container} from "../../utils/Container";
import {ParameterTypes} from "./ParameterTypes";
import {NeuroevolutionUtil} from "../../whiskerNet/NeuroevolutionUtil";
import {Randomness} from "../../utils/Randomness";

export class WaitEvent extends ScratchEvent {

    private steps: number;

    constructor(steps = 1) {
        super();
        this.steps = steps;
    }

    async apply(): Promise<void> {
        await Container.testDriver.runForSteps(this.steps);
    }

    public toJavaScript(): string {
        return `await t.runForSteps(${this.steps});`;
    }

    public toString(): string {
        return "Wait for " + this.steps + " steps";
    }

    numSearchParameter(): number {
        return 1;
    }

    getParameter(): number[] {
        return [this.steps];
    }

    getSearchParameterNames(): string[] {
        return ["Duration"];
    }

    setParameter(args:number[], testExecutor:ParameterTypes): void {
        switch (testExecutor){
            case ParameterTypes.RANDOM:
                this.steps = Randomness.getInstance().nextInt(0,421);
                break;
            case ParameterTypes.CODON:
                this.steps = args[0];
                break;
            case ParameterTypes.REGRESSION:
                this.steps = Math.round(NeuroevolutionUtil.relu(args[0]));
                break;
        }
        this.steps %= Container.config.getWaitStepUpperBound();
    }

    stringIdentifier(): string {
        return "WaitEvent";
    }
}
