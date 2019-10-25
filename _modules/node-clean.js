#!/usr/bin/env node

/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const echo  = require("./echo");
const shell = require("shelljs");


/**************************************************************************************************
 * Functions
 **************************************************************************************************/

const nodeClean = {
    cmd() {
        return 'rm -rf node_modules';
    },
    description() {
        return `Clean the frontend project's node modules (via ${this.cmd()})`;
    },
    run() {
        echo.message(`Recursively deleting 'node_modules' directory in ${shell.pwd()}...`);

        shell.rm("-rf", "node_modules");

        echo.success("'node_modules' directory deleted successfully!");
    },
}


/**************************************************************************************************
 * Exports
 **************************************************************************************************/

module.exports = nodeClean;