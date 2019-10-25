#!/usr/bin/env node

/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const dir     = require("./_modules/dir");
const echo    = require("./_modules/echo");
const file    = require("./_modules/file");
const path    = require("path");
const program = require("commander");
const shell   = require("shelljs");


/**************************************************************************************************
 * Variables
 **************************************************************************************************/


/**************************************************************************************************
 * Commands
 **************************************************************************************************/

// #region Commands

const deployAwsS3 = {
    cmds: {
        deploy: "",
    },
    description() {
        return "Publish build artifacts to Amazon S3 storage";
    },
    run() {

    },

};

// #endregion Commands


/**************************************************************************************************
 * Entrypoint / Command router
 **************************************************************************************************/

// #region Entrypoint / Command router

program
    .usage("option")
    .description(deployAwsS3.description())
    .option("--webpack", "Deploy webpack built frontend application")
    .parse(process.argv);

// #endregion Entrypoint / Command router

deployAwsS3.run();
