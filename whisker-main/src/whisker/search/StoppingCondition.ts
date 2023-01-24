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

import {Chromosome} from "./Chromosome";
import {SearchAlgorithm} from "./SearchAlgorithm";

/**
  * Query the status of the search algorithm to determine if it is finished
  */
export interface StoppingCondition<T extends Chromosome> {

    isFinished(algorithm: SearchAlgorithm<T>): Promise<boolean>;

    getProgress(algorithm: SearchAlgorithm<T>): Promise<number>;
}
