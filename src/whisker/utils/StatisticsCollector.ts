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

/**
 * Singleton class to collect statistics from search runs
 *
 */
export class StatisticsCollector {

    private static _instance: StatisticsCollector;

    private _fitnessFunctionCount: number;
    private _iterationCount: number;
    private _coveredFitnessFunctionsCount: number; // fitness value == 0 means covered
    private _bestCoverage: number;
    private _eventsCount: number; //executed events
    private _bestTestSuiteSize: number;

    /**
     * Private constructor to avoid instantiation
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {
        this._fitnessFunctionCount = 0;
        this._iterationCount = 0;
        this._coveredFitnessFunctionsCount = 0;
        this._eventsCount = 0;
        this._bestTestSuiteSize = 0;
        this._bestCoverage = 0;
    }

    public static getInstance() {
        if (!StatisticsCollector._instance) {
            StatisticsCollector._instance = new StatisticsCollector();
        }

        return StatisticsCollector._instance;
    }

    get fitnessFunctionCount(): number {
        return this._fitnessFunctionCount;
    }

    set fitnessFunctionCount(value: number) {
        this._fitnessFunctionCount = value;
    }

    get iterationCount(): number {
        return this._iterationCount;
    }

    set iterationCount(value: number) {
        this._iterationCount = value;
    }

    /**
     * Increments the number of iterations by one
     */
    public incrementIterationCount(): void {
        this._iterationCount++;
    }

    get coveredFitnessFunctionsCount(): number {
        return this._coveredFitnessFunctionsCount;
    }

    set coveredFitnessFunctionsCount(value: number) {
        this._coveredFitnessFunctionsCount = value;
    }

    /**
     * Increments the number of covered fitness functions by one
     */
    public incrementCoveredFitnessFunctionCount(): void {
        this._coveredFitnessFunctionsCount++;
    }

    get bestCoverage(): number {
        return this._bestCoverage;
    }

    set bestCoverage(value: number) {
        this._bestCoverage = value;
    }

    get eventsCount(): number {
        return this._eventsCount;
    }

    set eventsCount(value: number) {
        this._eventsCount = value;
    }

    /**
     * Increments the number executed events by one
     */
    public incrementEventsCount(): void {
        this._eventsCount++;
    }

    get bestTestSuiteSize(): number {
        return this._bestTestSuiteSize;
    }

    set bestTestSuiteSize(value: number) {
        this._bestTestSuiteSize = value;
    }

    public asCsv(): string {
        const headers = ["fitnessFunctionCount", "iterationCount", "coveredFitnessFunctionCount", "bestCoverage", "eventsCount", "bestTestSuiteSize"]
        const headerRow = headers.join(",");
        const data = [this._fitnessFunctionCount, this._iterationCount, this._coveredFitnessFunctionsCount, this._bestCoverage, this._eventsCount, this._bestTestSuiteSize]
        const dataRow = data.join(",");
        return [headerRow, dataRow].join("\n");
    }

    reset() {
        this._fitnessFunctionCount = 0;
        this._iterationCount = 0;
        this._coveredFitnessFunctionsCount = 0;
        this._eventsCount = 0;
        this._bestTestSuiteSize = 0;
        this._bestCoverage = 0;
    }
}