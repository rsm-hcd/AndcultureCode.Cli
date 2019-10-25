#!/usr/bin/env node

/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const dir          = require("./dir");
const echo         = require("./echo");
const frontendPath = require("./frontend-path");
const shell        = require("shelljs");


/**************************************************************************************************
 * Functions
 **************************************************************************************************/

const nodeRestore = {
    cmd() {
        return "npm install";
    },
    description() {
        return `Restore the frontend project's dependencies (via ${this.cmd}) found in ${frontendPath.projectDir()}`;
    },
    run() {
        dir.pushd(frontendPath.projectDir());
        echo.message(`Restoring npm packages (via ${this.cmd})...`);
        shell.exec(this.cmd);
        echo.success("Frontend project restored");
        dir.popd();
    },
};


/**************************************************************************************************
 * Exports
 **************************************************************************************************/

module.exports = nodeRestore;