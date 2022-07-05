/* eslint-disable node/no-unpublished-require */

const rimraf = require("rimraf");
const {attachRandomInputsToTest, attachErrorWitnessReplayToTest} = require("./witness-util");
const fs = require("fs");
const {basename, resolve} = require("path");
const TAP13Formatter = require('../whisker-main/src/test-runner/tap13-formatter');
const CoverageGenerator = require('../whisker-main/src/coverage/coverage');
const logger = require('./logger');

const {
    testPath,
    seed,
    acceleration,
    whiskerUrl,
    modelPath,
    modelRepetition,
    modelDuration,
    modelCaseSensitive,
    liveLog,
    liveOutputCoverage,
    addRandomInputs,
    mutators,
    mutantsDownloadPath,
    errorWitnessPath,
    numberOfTabs,
    scratchPath,
} = require("./cli").opts;

const tmpDir = './.tmpWorkingDir';

async function runTestsOnFile(page, targetProject) {
    const start = Date.now();

    const csvs = [];

    if (testPath) {
        const paths = prepareTestFiles();
        await Promise.all(paths.map((path, index) => runTests(path, page, index, targetProject)))
            .then(results => {
                const summaries = results.map(({summary}) => summary);
                const coverages = results.map(({coverage}) => coverage);
                const modelCoverage = results.map(({modelCoverage}) => modelCoverage);
                csvs.push(...results.map(({csv}) => csv));

                if (summaries[0] !== undefined) {
                    printTestResultsFromCoverageGenerator(summaries, CoverageGenerator.mergeCoverage(coverages),
                        modelCoverage[0]);
                }
                logger.debug(`Duration: ${(Date.now() - start) / 1000} Seconds`);
            })
            .catch(errors => logger.error('Error on executing tests: ', errors))
            .finally(() => rimraf.sync(tmpDir));

    } else {
        // model path given, test only by model
        await runTests(undefined, page, 0, targetProject)
            .then(result => {
                csvs.push(result.csv);

                printTestResultsFromCoverageGenerator([result.summary],
                    CoverageGenerator.mergeCoverage([result.coverage]), result.modelCoverage);
                logger.debug(`Duration: ${(Date.now() - start) / 1000} Seconds`);
            })
            .catch(errors => logger.error('Error on executing tests: ', errors))
            .finally(() => rimraf.sync(tmpDir));
    }
    return csvs;
}

/**
 * Shows the test generation and input recording features, the TAP13 and the log output.
 * @param {Page} page
 * @returns {Promise<void>}
 */
async function showHiddenFunctionality(page) {
    // a simple 'await (await page.$('#toggle-log')).click();' does not work here due to the toggle buttons
    const toggleAdvanced = await page.$('#toggle-advanced');
    await toggleAdvanced.evaluate(t => t.click());
    const toggleTap = await page.$('#toggle-tap');
    await toggleTap.evaluate(t => t.click());
    const toggleLog = await page.$('#toggle-log');
    await toggleLog.evaluate(t => t.click());
    const toggleModelEditor = await page.$('#toggle-model-editor');
    await toggleModelEditor.evaluate(t => t.click());
}

async function runTests(path, page, index, targetProject) {

    /**
     * Configure the Whisker instance, by setting the application file, test file and acceleration, after the page
     * was loaded.
     */
    async function configureWhiskerWebInstance() {
        await page.goto(whiskerUrl, {waitUntil: 'networkidle0'});
        await page.evaluate(factor => document.querySelector('#acceleration-value').innerText = factor, acceleration);
        await page.evaluate(s => document.querySelector('#seed').value = s, seed);
        await page.evaluate(m => document.querySelector('#container').mutators = m, mutators);
        await (await page.$('#fileselect-project')).uploadFile(targetProject);
        if (testPath) {
            await (await page.$('#fileselect-tests')).uploadFile(path);
        }
        if (modelPath) {
            await (await page.$('#fileselect-models')).uploadFile(modelPath);
            await page.evaluate(factor => document.querySelector('#model-repetitions').value = factor, modelRepetition);
            await page.evaluate(factor => document.querySelector('#model-duration').value = factor, modelDuration);
            if (modelCaseSensitive === "true") {
                await (await page.$('#model-case-sensitive')).click();
            }
        }
        await showHiddenFunctionality(page);
    }

    /**
     * Executes the tests, by clicking the button.
     */
    async function executeTests() {
        await (await page.$('#run-all-tests')).click();
    }

    /**
     * Reads the coverage and log field until the summary is printed into the coverage field, indicating that the test
     * run is over.
     */
    async function readTestOutput() {
        const coverageOutput = await page.$('#output-run .output-content');
        const logOutput = await page.$('#output-log .output-content');

        let coverageLog = '';
        let log = '';

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const currentLog = await (await logOutput.getProperty('innerHTML')).jsonValue();
            if (currentLog.includes('projectName')) {

                // Download mutants
                if (mutantsDownloadPath) {
                    await downloadMutants(mutantsDownloadPath);
                }

                // Return CSV file
                const currentLogString = currentLog.toString();
                return currentLogString.slice(currentLogString.indexOf('projectName'));
            }

            if (liveLog) {
                const currentLog = await (await logOutput.getProperty('innerHTML')).jsonValue();
                const newInfoFromLog = currentLog.replace(log, '').trim();

                if (newInfoFromLog.length) {
                    logger.log(newInfoFromLog);
                }

                log = currentLog;
            }

            const currentCoverageLog = await (await coverageOutput.getProperty('innerHTML')).jsonValue();
            const newInfoFromCoverage = currentCoverageLog.replace(coverageLog, '').trim();
            if (newInfoFromCoverage.length && liveOutputCoverage) {
                logger.log(`Page ${index} | Coverage: `, newInfoFromCoverage);
            } else if (newInfoFromCoverage.includes('not ok ')) {
                logger.warn(`Page ${index} | Coverage: `, newInfoFromCoverage);
            }
            coverageLog = currentCoverageLog;

            if (currentCoverageLog.includes('summary')) {
                break;
            }

            await page.waitForTimeout(1000);
        }
    }

    /**
     * Downloads the generated Scratch mutants.
     * @param downloadPath the path the mutants should be saved to.
     */
    async function downloadMutants(downloadPath) {
        await page._client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: downloadPath
        });
        await (await page.$('.output-save')).click();
        await page.waitForTimeout(5000);
    }

    /**
     * Generates a coverage object based on the coveredBlockIdsPerSprite and blockIdsPerSprite from the
     * CoverageGenerator used in serializeAndReturnCoverageObject.
     *
     * @param {*} serializedCoverage  The coverage object, using array and objects instead of maps and sets, as it was
     *                                serialized by puppeteer
     * @returns {coverage}            The coverage object
     */
    function convertSerializedCoverageToCoverage(serializedCoverage) {
        const coveredBlockIdsPerSprite = new Map();
        serializedCoverage.coveredBlockIdsPerSprite
            .forEach(({key, values}) => coveredBlockIdsPerSprite.set(key, new Set(values)));
        const blockIdsPerSprite = new Map();
        serializedCoverage.blockIdsPerSprite.forEach(({key, values}) => blockIdsPerSprite.set(key, new Set(values)));
        return {coveredBlockIdsPerSprite, blockIdsPerSprite};
    }

    /**
     * Generates a model coverage object based on the coveragePerModel and missedEdges.
     *
     * @param {*} serializedCoverage  The model coverage object using array and objects instead of maps and sets, as it was
     *                                serialized by puppeter
     */
    function convertSerializedModelCoverage(serializedCoverage) {
        const modelCoverage = {};
        serializedCoverage.modelCoverage.forEach(({key, values}) => {
            const coverageObject = {};
            values.forEach(({key, values}) => {
                coverageObject[key] = values;
            })
            modelCoverage[key] = coverageObject;
        });
        return modelCoverage;
    }

    /**
     * Uses the CoverageGenerator, which is attached to the window object in the whisker-web/index.js to get the coverage
     * of the test run and transfer it from the Whisker instance in the browser to this script.
     * The original Maps and Sets have to be reworked to be a collection of objects and arrays, otherwise the coverage raw
     * data cannot be transferred from the Chrome instance to the nodejs instance.
     */
    async function onFinishedCallback() {
        return page.evaluate(() => new Promise(resolve => {
            document.defaultView.messageServantCallback = message => resolve(message);
        }));
    }

    try {
        await configureWhiskerWebInstance();
        const promise = onFinishedCallback();
        await executeTests();

        const csvRow = await readTestOutput();
        const {serializableCoverageObject, summary, serializableModelCoverage} = await promise;

        return Promise.resolve({
            summary, coverage: convertSerializedCoverageToCoverage(serializableCoverageObject),
            csv: csvRow, modelCoverage: convertSerializedModelCoverage(serializableModelCoverage)
        });
    } catch (e) {
        logger.error(e);
        return Promise.reject(e);
    }
}

/**
 * Wrapper for the test file preparation, creating the temporary working directory and reading, distributing and writing
 * the files.
 *
 * @param {*} whiskerTestPath  Path to the whisker test file
 * @returns {Array}            The paths of the temporary test files
 */
function prepareTestFiles(whiskerTestPath = testPath) {
    if (addRandomInputs) {
        whiskerTestPath = attachRandomInputsToTest(whiskerTestPath, tmpDir, addRandomInputs);
    }

    if (errorWitnessPath) {
        whiskerTestPath = attachErrorWitnessReplayToTest(errorWitnessPath, whiskerTestPath, tmpDir);
    }

    const {evaledTest, testSourceWithoutExportArray} = prepareTestSource(whiskerTestPath);
    const singleTestSources = splitTestsSourceCodeIntoSingleTestSources(evaledTest);
    const testSourcesPerTab = distributeTestSourcesOverTabs(numberOfTabs, singleTestSources);

    if (fs.existsSync(tmpDir)) {
        fs.rmdirSync(tmpDir, {recursive: true});
    }
    fs.mkdirSync(tmpDir);

    return testSourcesPerTab.map((testSources, index) => {
        const path = `${tmpDir}/${basename(whiskerTestPath)}_${index + 1}.js`;
        fs.writeFileSync(path, `${testSourceWithoutExportArray} [${testSources}]`, {encoding: 'utf8'});
        return path;
    });
}

/**
 * Takes the evaled test declarations and returns them as parseable javascript code.
 *
 * @param {*} tests     The evaled code of the test declerations
 * @returns {Array}     The test declerations as parseable ajavscript
 */
function splitTestsSourceCodeIntoSingleTestSources(tests) {
    return tests.reverse()
        .map(test => {
            const testDescription = JSON.parse(JSON.stringify(test));
            testDescription.test = test.test.name;

            return JSON.stringify(testDescription, null, 2)
                .replace('"name"', 'name')
                .replace('"description"', 'description')
                .replace('"categories"', 'categories')
                .replace('"test"', 'test')
                .replace(`"${test.test.name}"`, `${test.test.name}`);
        });
}

/**
 * Distributes the tests over the tabs / pages of the chrome instance.
 *
 * @param {number} tabs          The number of tabs puppeteer will open
 * @param {*} singleTestSources  A parseable test decleration
 * @returns {Array}              An array with the length of the amount of tabs that will be started, containing a
 *                               collection of test declerations for each of the tabs
 */
function distributeTestSourcesOverTabs(tabs, singleTestSources) {
    let index = 0;
    const testSourcesPerTab = [];

    while (singleTestSources.length) {
        testSourcesPerTab[index] = testSourcesPerTab[index] ?
            testSourcesPerTab[index].concat(', ')
                .concat(singleTestSources.pop()) :
            singleTestSources.pop();

        index++;

        if (index > tabs - 1) {
            index = 0;
        }
    }

    return testSourcesPerTab;
}

/**
 * Logs the coverage and results (number of fails, pass or skip) to the console in a more readable way.
 *
 * @param {string} summaries The summaries from the whisker-web instance test run
 * @param {string} coverage  Combined coverage of from all pages
 * @param {Map} modelCoverage  Coverage of the models.
 */
function printTestResultsFromCoverageGenerator(summaries, coverage, modelCoverage) {
    const formattedSummary = TAP13Formatter.mergeFormattedSummaries(summaries.map(TAP13Formatter.formatSummary));
    const formattedCoverage = TAP13Formatter.formatCoverage(coverage.getCoveragePerSprite());

    const summaryString = TAP13Formatter.extraToYAML({summary: formattedSummary});
    const coverageString = TAP13Formatter.extraToYAML({coverage: formattedCoverage});

    const formattedModelCoverage = TAP13Formatter.formatModelCoverage(modelCoverage);
    const modelCoverageString = TAP13Formatter.extraToYAML({modelCoverage: formattedModelCoverage});

    logger.info(`\nSummary:\n ${summaryString}`);
    logger.info(`\nCoverage:\n ${coverageString}`);
    logger.info(`\nModel coverage:\n ${modelCoverageString}`);
}

/**
 * Prepares the test source code, by evaluating the tests and returning the source code of the tests without the
 * `modules.export` statement at the end.
 *
 * @param {*} path        The path to the file where the original tests are defined in
 * @returns {object}      The evaluated tests and source code of the tests without the `modules.export` statement
 */
function prepareTestSource(path) {
    const exportStatement = 'module.exports =';
    const test = fs.readFileSync(path, {encoding: 'utf8'});
    const testArrayStartIndex = test.indexOf(exportStatement) + exportStatement.length;
    const testSourceWithoutExportArray = test.substr(0, testArrayStartIndex);
    // eslint-disable-next-line no-eval
    const evaledTest = eval(test);

    return {evaledTest, testSourceWithoutExportArray};
}

function getProjectsInScratchPath() {
    const {path, isDirectory} = scratchPath;

    if (!isDirectory) {
        return [path];
    }

    return fs.readdirSync(path)
        .filter((file) => file.endsWith(".sb3"))
        .map((file) => resolve(path, file));
}


module.exports = {
    runTestsOnFile,
    showHiddenFunctionality,
    tmpDir,
    prepareTestFiles,
    getProjectsInScratchPath,
}
