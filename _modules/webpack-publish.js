#!/usr/bin/env node

/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const nodeClean    = require("./node-clean");
const frontendPath = require("./frontend-path");
const nodeRestore  = require("./node-restore");
const echo         = require("./echo");
const shell        = require("shelljs");


/**************************************************************************************************
 * Functions
 **************************************************************************************************/

const webpackPublish = {
    cmd() {
        return "npm run build";
    },
    description() {
        return `Publishes a release build of the frontend project (via ${this.cmd()}) in ${frontendPath.projectDir()}`;
    },
    run() {
        // Clean publish directory
        echo.message(`Cleaning publish directory ${frontendPath.publishDir()}...`);

        if (shell.rm("-rf", frontendPath.publishDir()).code !== 0) {
            echo.error("Failed cleaning publish directory");
            shell.exit(1);
        }
        echo.success("Publish directory cleaned");

        // Change directory into frontend folder
        shell.pushd(frontendPath.projectDir());

        // Clean and restore node dependencies
        nodeClean.run();
        nodeRestore.run();

        // Build frontend
        echo.message(`Building frontend (via ${this.cmd()})...`);

        const result = shell.exec(this.cmd(), { silent: false });
        if (result.code === 0) {
            echo.success("Frontend built successfully");
        } else {
            echo.error("Failed to build frontend");
        }

        shell.popd();

        return result.code === 0;
    },
};


/**************************************************************************************************
 * Exports
 **************************************************************************************************/

module.exports = webpackPublish;
