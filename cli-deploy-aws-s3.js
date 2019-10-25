#!/usr/bin/env node

/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const echo           = require("./_modules/echo");
const program        = require("commander");
const shell          = require("shelljs");
const webpackPublish = require("./_modules/webpack-publish");


/**************************************************************************************************
 * Variables
 **************************************************************************************************/

const pythonInstallerUrl = "https://www.python.org/ftp/python/3.7.4/python-3.7.4-amd64.exe";


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
        // Check system/command requirements
        this.validateOrExit();

        // Locally publish frontend
        const publishResult = webpackPublish.run();
        if (!publishResult) {
            shell.exit(1);
        }

        // Deploy build artifacts to S3
        const accessKey = program.accessKey;
        const secretKey = program.secretKey;
    },
    validateOrExit() {
        const errors = [];

        // Validate arguments
        const accessKey = program.accessKey;
        if (accessKey === undefined || accessKey === null) {
            errors.push("--access-key is required");
        }

        const secretKey = program.secretKey;
        if (secretKey === undefined || secretKey === null) {
            errors.push("--secret-key is required");
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
    .option("--access-key <key>", "Required remote storage access key")
    .option("--public-url <url>", "Optional URL replaced in release files (ie. absolute S3 bucket URL)")
    .option("--secret-key <key>", "Required remote storage secret key")
    .option("--webpack",          "Deploy webpack built frontend application")
    .parse(process.argv);

// #endregion Entrypoint / Command router

deployAwsS3.run();
