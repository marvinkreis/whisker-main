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

import {List} from "../../../../src/whisker/utils/List";
import {BitstringChromosome} from "../../../../src/whisker/bitstring/BitstringChromosome";
import {BitflipMutation} from "../../../../src/whisker/bitstring/BitflipMutation";
import {SinglePointCrossover} from "../../../../src/whisker/search/operators/SinglePointCrossover";
import {TournamentSelection} from "../../../../src/whisker/search/operators/TournamentSelection";
import {OneMaxFitnessFunction} from "../../../../src/whisker/bitstring/OneMaxFitnessFunction";

class InverseOneMaxFitnessFunction extends OneMaxFitnessFunction {

    constructor(size: number) {
        super(size);
    }

    getFitness(chromosome: BitstringChromosome): number {
        return this._size - (super.getFitness(chromosome));
    }

    compare (value1: number, value2: number): number {
        // Smaller fitness values are better
        return value1 - value2;
    }

    isOptimal(fitnessValue: number): boolean {
        return fitnessValue == 0;
    }
}

describe('TournamentSelection', () => {

    test('Select best for maximizing fitness function', async () => {
        const goodBits = new List<boolean>();
        goodBits.add(true);
        goodBits.add(true);
        const betterChromosome = new BitstringChromosome(goodBits,
            new BitflipMutation(), new SinglePointCrossover<BitstringChromosome>());

        const worseBits = new List<boolean>();
        worseBits.add(false);
        worseBits.add(false);
        const worseChromosome = new BitstringChromosome(worseBits,
            new BitflipMutation(), new SinglePointCrossover<BitstringChromosome>());

        const population = new List<BitstringChromosome>();
        population.add(betterChromosome);
        population.add(worseChromosome);

        const fitnessFunction = new OneMaxFitnessFunction(2);
        const selection = new TournamentSelection<BitstringChromosome>(20);
        const winner = await selection.apply(population, fitnessFunction);

        expect(winner.getFitness(fitnessFunction)).toBe(2);
    });

    test('Select best for minimizing fitness function', async () => {
        const goodBits = new List<boolean>();
        goodBits.add(true);
        goodBits.add(true);
        const betterChromosome = new BitstringChromosome(goodBits,
            new BitflipMutation(), new SinglePointCrossover<BitstringChromosome>());

        const worseBits = new List<boolean>();
        worseBits.add(false);
        worseBits.add(false);
        const worseChromosome = new BitstringChromosome(goodBits,
            new BitflipMutation(), new SinglePointCrossover<BitstringChromosome>());

        const population = new List<BitstringChromosome>();
        population.add(betterChromosome);
        population.add(worseChromosome);

        const fitnessFunction = new InverseOneMaxFitnessFunction(2);
        const selection = new TournamentSelection<BitstringChromosome>(20);
        const winner = await selection.apply(population, fitnessFunction);

        expect(winner.getFitness(fitnessFunction)).toBe(0);
    });
});
