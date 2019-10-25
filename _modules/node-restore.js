#!/usr/bin/env node

/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const dir          = require("./dir");
const echo         = require("./echo");
const shell        = require("shelljs");


/**************************************************************************************************
 * Functions
 **************************************************************************************************/

const nodeRestore = {
    cmd() {
        return "npm install";
    },
    description() {
        return `Restore the frontend project's dependencies (via ${this.cmd()}) found in ${shell.pwd()}`;
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