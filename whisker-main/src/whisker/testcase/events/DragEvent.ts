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

import {ScratchEvent} from "../ScratchEvent";
import {Container} from "../../utils/Container";
import {List} from "../../utils/List";



export class DragEvent implements ScratchEvent {

    private _x: number;
    private _y: number;
    private readonly _spriteName: string;

    constructor(x: number, y:number, spriteName:string) {
        this._x = x;
        this._y = y;
        this._spriteName = spriteName;
    }

    async applyWithCoordinates(args: number[]): Promise<void> {
        const {x, y} = Container.vmWrapper.getScratchCoords(args[0], args[1])
        this._x = x;
        this._y = y;
        Container.testDriver.inputImmediate({
            device: 'drag',
            sprite: this._spriteName,
            x: Math.trunc(x),
            y: Math.trunc(y)
        });
    }

    async apply(): Promise<void> {
        const {x, y} = Container.vmWrapper.getScratchCoords(this._x, this._y)
        Container.testDriver.inputImmediate({
            device: 'drag',
            sprite: this._spriteName,
            x: Math.trunc(x),
            y: Math.trunc(y)
        });
    }

    public toJavaScript(args: number[]): string {
        const {x, y} = Container.vmWrapper.getScratchCoords(args[0], args[1])
        return '' +
            `t.inputImmediate({
    device: 'drag',
    x: ${Math.trunc(x)},
    y: ${Math.trunc(y)}
});`
    }

    public toString(args: number[]): string {
        const {x, y} = Container.vmWrapper.getScratchCoords(args[0], args[1])
        return "Drag " + Math.trunc(x) + "/" + Math.trunc(y);
    }

    getNumParameters(): number {
        return 2;
    }

    getParameter(): number[] {
        return [this._x, this._y];
    }

    setParameter(codons: List<number>, codonPosition: number): void {
        this._x = codons.get(codonPosition % codons.size());
        codonPosition++;
        this._y = codons.get(codonPosition % codons.size());
    }
}
