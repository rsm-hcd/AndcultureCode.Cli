#!/usr/bin/env node

// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const { CLI_NAME } = require("./modules/constants");
const commandRegistry = require("./modules/command-registry");
const program = require("commander");
const shell = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

const deployTypes = shell
    .ls(__dirname)
    .filter((file) => !file.includes("test"))
    .filter((file) => file.startsWith(`${CLI_NAME}-deploy-`))
    .map((file) => file.match(/and-cli-deploy-(.*)\.js/)[1]);

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Entrypoint
// -----------------------------------------------------------------------------------------

program.description("Runs deployments for various application types");

commandRegistry.registerCommands(
    deployTypes.map((deployType) => {
        return {
            command: deployType,
            description: `Run deployments for ${deployType}`,
        };
    })
);

program.parse(process.argv);

// #endregion Entrypoint
