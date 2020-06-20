// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const echo  = require("./echo");
const shell = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const nodeRestore = {
    cmd() {
        return "npm install";
    },
    description() {
        return `Restore npm dependencies (via ${this.cmd()}) in the current directory`;
    },
    run() {
        echo.message(`Restoring npm packages (via ${this.cmd()}) in ${shell.pwd()}...`);
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
