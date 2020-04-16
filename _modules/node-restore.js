#!/usr/bin/env node

/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const echo  = require("./echo");
const shell = require("shelljs");

/**************************************************************************************************
 * Functions
 **************************************************************************************************/

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

/**************************************************************************************************
 * Exports
 **************************************************************************************************/

module.exports = nodeRestore;
