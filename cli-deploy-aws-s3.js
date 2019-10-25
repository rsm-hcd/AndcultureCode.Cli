#!/usr/bin/env node

/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const program        = require("commander");
const shell          = require("shelljs");
const webpackPublish = require("./_modules/webpack-publish");


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
        // Locally publish frontend
        const publishResult = webpackPublish.run();
        if (!publishResult) {
            shell.exit(1);
        }
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
