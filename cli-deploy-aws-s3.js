#!/usr/bin/env node

/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const echo           = require("./_modules/echo");
const frontendPath   = require("./_modules/frontend-path");
const program        = require("commander");
const shell          = require("shelljs");
const webpackPublish = require("./_modules/webpack-publish");


/**************************************************************************************************
 * Variables
 **************************************************************************************************/

let   destination        = null;
let   profile            = null;
const pythonInstallerUrl = "https://www.python.org/ftp/python/3.7.4/python-3.7.4-amd64.exe";
let   sourcePath         = frontendPath.publishDir();


/**************************************************************************************************
 * Commands
 **************************************************************************************************/

// #region Commands

const deployAwsS3 = {

    cmd(src, dest) {
        return `aws s3 sync ${src} s3://${dest}`;
    },
    description() {
        return "Publish build artifacts to Amazon S3 storage";
    },
    run() {
        // Check system/command requirements
        this.validateOrExit();

        // Locally publish frontend via webpack
        if (program.publish && program.webpack) {
            const publishResult = webpackPublish.run();
            if (!publishResult) {
                shell.exit(1);
            }
        }

        // Deploy build artifacts to S3
        echo.message("Copying local build artifacts to Amazon S3...");
        echo.message(` - Profile: ${profile}`);
        echo.message(` - Source path: ${sourcePath}`);
        echo.message(` - Destination path: ${destination}`);

        const syncCommand = this.cmd(sourcePath, destination) + ` --profile ${profile}`;
        echo.message(` - Command: ${syncCommand}`);
        if (shell.exec(syncCommand, { silent: false }).code !== 0) {
            echo.error(" - Failed to deploy to AWS S3");
            shell.exit(1);
        }

        echo.newLine();
        echo.success("Application successfully deployed to AWS S3!");
    },
    validateOrExit() {
        const errors = [];

        // Validate arguments
        profile = program.profile;
        if (profile === undefined || profile === null) {
            errors.push("--profile is required");
        }

        destination = program.destination;
        if (destination === undefined || destination === null) {
            errors.push("--destination is required");
        }

        if (program.source !== undefined && program.source !== null) {
            sourcePath = program.source;
        }

        // Bail if up-front arguments are errored
        if (errors.length > 0) {
            echo.errors(errors);
            shell.exit(1);
        }

        if (!shell.which("python")) {
            echo.error(`Python 3.7+ is required - ${pythonInstallerUrl}`);
            shell.exit(1);
        }

        if (!shell.which("pip")) {
            echo.error(`PIP is required - ${pythonInstallerUrl}`);
            shell.exit(1);
        }

        if (!shell.which("aws")) {
            echo.message("AWS CLI not found. Installing via PIP...");

            if (shell.exec("pip install awscli").code !== 0) {
                echo.error("Failed to install aws cli via pip");
                shell.exit(1);
            }

            echo.success(" - Successfully installed AWS CLI");
        }

        // Handle errors
        if (errors.length > 0) {
            echo.errors(errors);
            shell.exit(1);
        }

        return true;
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
    .option("--destination <destination>", "Required container/bucket folder path (ie. my-bucket/path/to/folder)")
    .option("--profile <profile>",         "Required AWS S3 profile configured in either ~/.aws/config or ~/.aws/credentials")
    .option("--public-url <url>",          "Optional URL replaced in release files (ie. absolute S3 bucket URL)")
    .option("--publish",                   "Optional flag to run a webpack publish")
    .option("--source <source>",           `Optional path of folder to copy from this machine. Default is '${frontendPath.publishDir()}'`)
    .option("--webpack",                   "Deploy webpack built frontend application")
    .parse(process.argv);

// #endregion Entrypoint / Command router

deployAwsS3.run();
