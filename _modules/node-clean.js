// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const echo = require("./echo");
const shell = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const nodeClean = {
    cmd() {
        return "rm -rf node_modules";
    },
    description() {
        return `Clean the npm dependencies (via ${this.cmd()}) in the current directory`;
    },
    run() {
        echo.message(
            `Recursively deleting 'node_modules' directory in ${shell.pwd()}...`
        );

        shell.rm("-rf", "node_modules");

        echo.success("'node_modules' directory deleted successfully!");
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = nodeClean;

// #endregion Exports
