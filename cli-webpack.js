#!/usr/bin/env node

/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const commands      = require("./_modules/commands");
const dir           = require("./_modules/dir");
const echo          = require("./_modules/echo");
const frontendPath  = require("./_modules/frontend-path");
const nodeClean     = require("./_modules/node-clean");
const nodeRestore   = require("./_modules/node-restore");
const program       = require("commander");
const shell         = require("shelljs");


/**************************************************************************************************
 * Variables
 **************************************************************************************************/


/**************************************************************************************************
 * Commands
 **************************************************************************************************/

// #region Webpack commands

const webpack = {
    cmd() {
        return `npm run start`;
    },
    description(mode) {
        return `Runs the webpack project (via ${this.cmd(mode)}) found in ${frontendPath.projectDir()}`;
    },
    run(mode) {
        if (program.clean) {
            nodeClean.run();
        }

        if (program.restore) {
            nodeRestore.run();
        }

        dir.pushd(frontendPath.projectDir());

        echo.message(`Running frontend (via ${this.cmd(mode)})...`);
        shell.exec(this.cmd(), { silent: false, async: true });

        dir.popd();
    },
};

// #endregion Webpack commands


/**************************************************************************************************
 * Entrypoint / Command router
 **************************************************************************************************/

// #region Entrypoint / Command router

program
    .usage("option(s)")
    .description(
        `${commands.webpack.description} Certain options can be chained together for specific behavior` +
        "(--clean and --restore can be used in conjunction)."
    )
    .option("-c, --clean",   nodeClean.description())
    .option("-R, --restore", nodeRestore.description())
    .parse(process.argv);

// If no options are passed in, run application
if (process.argv.slice(2).length === 0) { webpack.run("run"); }

// #endregion Entrypoint / Command router