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

import {ScratchProject} from './scratch/ScratchProject';
import {NotYetImplementedException} from './core/exceptions/NotYetImplementedException';
import {TestGenerator} from './testgenerator/TestGenerator';
import {TestSuiteWriter} from './testgenerator/TestSuiteWriter';

export class Main {

    createTestSuite(projectFile: string, testSuiteFile: string) {
        const scratchProject = new ScratchProject(projectFile);

        // TODO: Probably need to instantiate ScratchVM as well here?

        const testGenerator = this._selectTestGenerator();
        const testSuite = testGenerator.generateTests(scratchProject);

        const testSuiteWriter = new TestSuiteWriter();
        testSuiteWriter.writeTests(testSuiteFile, testSuite);
    }

    _selectTestGenerator() : TestGenerator {
        // TODO: Select RandomTestGenerator, IterativeSearchBasedTestGenerator, or MOGenerator
        throw new NotYetImplementedException();
    }
}