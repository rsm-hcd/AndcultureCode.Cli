// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const commandStringFactory = require("../utilities/command-string-factory");
const echo = require("./echo");
const optionStringFactory = require("../utilities/option-string-factory");
const shell = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const NODE_MODULES_DIR = "node_modules";

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const nodeClean = {
    cmd() {
        return commandStringFactory.build("rm", "-rf", NODE_MODULES_DIR);
    },
    description() {
        return `Clean the npm dependencies (via ${this.cmd()}) in the current directory`;
    },
    getOptions() {
        return optionStringFactory.build("clean", "c");
    },
    run() {
        echo.message(
            `Recursively deleting '${NODE_MODULES_DIR}' directory in ${shell.pwd()}...`
        );

        shell.rm("-rf", NODE_MODULES_DIR);

        echo.success(`'${NODE_MODULES_DIR}' directory deleted successfully!`);
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = nodeClean;

// #endregion Exports
