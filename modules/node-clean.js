// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const { NODE_MODULES } = require("./constants");
const commandStringFactory = require("../utilities/command-string-factory");
const echo = require("./echo");
const optionStringFactory = require("../utilities/option-string-factory");
const shell = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const nodeClean = {
    cmd() {
        return commandStringFactory.build("rm", "-rf", NODE_MODULES);
    },
    description() {
        return `Clean the npm dependencies (via ${this.cmd()}) in the current directory`;
    },
    getOptions() {
        return optionStringFactory.build("clean", "c");
    },
    run() {
        echo.message(
            `Recursively deleting '${NODE_MODULES}' directory in ${shell.pwd()}...`
        );

        shell.rm("-rf", NODE_MODULES);

        echo.success(`'${NODE_MODULES}' directory deleted successfully!`);
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = nodeClean;

// #endregion Exports
