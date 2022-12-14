const fs = require('fs');
const {InvalidArgumentError} = require('commander');
const {isAbsolute, resolve, dirname} = require('path');

/*
 * Helper functions.
 */

function asAbsolutePath(path) {
    return isAbsolute(path) ? path : resolve(process.cwd(), path);
}

function relativeToServantDir(path) {
    return resolve(__dirname, path);
}

/*
 * Assertion functions that throw an error when a requirement is violated.
 */

function mustBeFile(path, extension = "") {
    if (!fs.existsSync(path)) {
        throw new InvalidArgumentError('File must exist.');
    }

    if (!fs.lstatSync(path).isFile()) {
        throw new InvalidArgumentError('Must be a file.')
    }

    if (!path.endsWith(extension)) {
        throw new InvalidArgumentError(`Must be "${extension}" file.`);
    }
}

function mustBeDirectory(path) {
    if (!fs.existsSync(path)) {
        throw new InvalidArgumentError('Directory must exist.');
    }

    if (!fs.lstatSync(path).isDirectory()) {
        throw new InvalidArgumentError('Must be a directory.')
    }
}

function mustNotExist(path) {
    if (fs.existsSync(path)) {
        throw new InvalidArgumentError('Already exists.');
    }
}

function mustBePositiveInt(value) {
    if (isNaN(value) || value < 1) {
        throw new InvalidArgumentError('Must be positive integer.');
    }
}

/*
 * Functions to process command line arguments. Typically, these invoke the assertion functions defined above, and
 * also canonicalize inputs, e.g., by converting relative paths to absolute ones, or parsing strings as numbers. It
 * is important to return the processed input argument when done.
 */

function processFilePathExists(path, extension = '') {
    path = asAbsolutePath(path);
    mustBeFile(path, extension);
    return path;
}

function processFilePathNotExists(path) {
    path = asAbsolutePath(path);
    mustNotExist(path);
    mustBeDirectory(dirname(path));
    return path;
}

function processDirPathExists(path) {
    path = asAbsolutePath(path);
    mustBeDirectory(path);
    return path;
}

function processFileOrDirPathExists(path, extension = '') {
    path = asAbsolutePath(path);
    let isDirectory = undefined;

    try {
        mustBeFile(path, extension);
        isDirectory = false;
    } catch {
        try {
            mustBeDirectory(path);
            isDirectory = true;
        } catch {
            throw new InvalidArgumentError(`Directory or "${extension}" file must exist.`);
        }
    }

    return {
        path,
        isDirectory,
    };
}

function processPositiveInt(value) {
    value = parseInt(value);
    mustBePositiveInt(value);
    return value;
}

function processMutationOperator(operator) {
    // FIXME: MutationFactory should export these instead of having them to hard-code here
    const supportedOperators = ['KRM', 'SBD', 'SDM', 'AOR', 'LOR', 'ROR', 'NCM', 'VRM', 'ALL'];

    if (!supportedOperators.includes(operator)) {
        throw new InvalidArgumentError(`Unknown mutation operator "${operator}"`);
    }

    return operator;
}

function processNumberOfJobs(numberOfJobs) {
    numberOfJobs = processPositiveInt(numberOfJobs);

    const cpus = require('os').cpus().length;
    if (numberOfJobs > cpus) {
        throw new InvalidArgumentError(`Your system cannot handle more than ${cpus} tabs.`);
    }

    return numberOfJobs;
}

module.exports = {
    processFilePathExists,
    processDirPathExists,
    processFileOrDirPathExists,
    processFilePathNotExists,
    processPositiveInt,
    processMutationOperator,
    processNumberOfJobs,
    asAbsolutePath,
    relativeToServantDir,
}
