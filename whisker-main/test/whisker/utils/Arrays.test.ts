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

import {ClickStageEvent} from "../../../src/whisker/testcase/events/ClickStageEvent";
import {MouseMoveEvent} from "../../../src/whisker/testcase/events/MouseMoveEvent";
import {WaitEvent} from "../../../src/whisker/testcase/events/WaitEvent";
import {KeyPressEvent} from "../../../src/whisker/testcase/events/KeyPressEvent";
import Arrays from "../../../src/whisker/utils/Arrays";

describe("Arrays", () => {

    let array: number[];

    beforeEach(() => {
        array = [1, 2, 3];
    })

    test("Is array empty", () => {
        const empty = [];
        expect(Arrays.isEmpty(array)).toBeFalsy();
        expect(Arrays.isEmpty(empty)).toBeTruthy();
    });

    test("Add element to array", () => {
        array.push(4);
        expect(array.length).toBe(4);
    });

    test("Insert element to array", () => {
        Arrays.insert(array, 4, 1)
        expect(array).toEqual([1, 4, 2, 3]);
    });

    test("Replace oldElement with a new one", () => {
        const wasSuccessFull = Arrays.replace(array, 2, 5);
        expect(wasSuccessFull).toBeTruthy();
        expect(array).toEqual([1, 5, 3]);
    });

    test("Try to replace a non existing oldElement with a new one", () => {
        const wasSuccessFull = Arrays.replace(array, -1, 5);
        expect(wasSuccessFull).toBeFalsy();
        expect(array).toEqual([1, 2, 3]);
    });

    test("Replace element given an index", () => {
        const wasSuccessFull = Arrays.replaceAt(array, 4, 1);
        expect(wasSuccessFull).toBeTruthy();
        expect(array).toEqual([1, 4, 3]);
    });

    test("Try to replace element given a non valid index", () => {
        const wasSuccessFull = Arrays.replaceAt(array, 4, -1);
        expect(wasSuccessFull).toBeFalsy();
        expect(array).toEqual([1, 2, 3]);
    });

    test("Test FindElement", () => {
        expect(Arrays.findElement(array, 2)).toEqual(1);
    });

    test("Clear array", () => {
        Arrays.clear(array);
        expect(array.length).toBe(0);
    });

    test("Clone array", () => {
        const clone = Arrays.clone(array);
        Arrays.clear(array);
        expect(clone.length).toBe(3);
    });

    test("Remove element from array", () => {
        Arrays.remove(array, 2);
        expect(array[1]).toBe(3);
    });

    test("Remove element from array given an index", () => {
        Arrays.removeAt(array, 1);
        expect(array[1]).toBe(3);
    });

    test("Get distinct array", () => {
        const array = [1, 2, 3, 3];
        const distinct = Arrays.distinct(array);
        expect(distinct.length).toBe(3);
    });

    test("Shuffle array", () => {
        const array = [0, 1, 2, 3, 4];
        const changed = [false, false, false, false, false];
        for (let i = 0; i < 100; i++) {
            Arrays.shuffle(array);
            for (let position = 0; position < array.length; position++) {
                if (array[position] != position) {
                    changed[position] = true;
                }
            }
        }
        expect(changed.includes(false)).toBeFalsy();
    });

    test("Sort array", () => {
        const array = [4, 3, 2, 1];
        Arrays.sort(array);
        expect(array[0]).toBe(1);
        expect(array[1]).toBe(2);
        expect(array[2]).toBe(3);
        expect(array[3]).toBe(4);
    });

    test("Distinct objects", () => {
        const array = [new ClickStageEvent(), new ClickStageEvent(), new ClickStageEvent()];
        const distinct = Arrays.distinctObjects(array);
        expect(distinct.length).toBe(1);
    });
});
