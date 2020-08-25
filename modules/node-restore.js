// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const commandStringFactory = require("../utilities/command-string-factory");
const echo = require("./echo");
const optionStringFactory = require("../utilities/option-string-factory");
const shell = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const nodeRestore = {
    cmd() {
        return commandStringFactory.build("npm", "install");
    },
    description() {
        return `Restore npm dependencies (via ${this.cmd()}) in the current directory`;
    },
    getOptions() {
        return optionStringFactory.build("restore", "R");
    },
    run() {
        echo.message(
            `Restoring npm packages (via ${this.cmd()}) in ${shell.pwd()}...`
        );
        shell.exec(this.cmd(), { silent: false });
        echo.success("npm packages restored");
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = nodeRestore;

// #endregion Exports
