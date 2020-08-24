#!/usr/bin/env node

// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const program = require("commander");
const shell = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

const deployTypes = shell
    .ls(__dirname)
    .filter((file) => !file.includes("test"))
    .filter((file) => file.startsWith("and-cli-deploy-"))
    .map((file) => file.match(/and-cli-deploy-(.*)\.js/)[1]);

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Entrypoint
// -----------------------------------------------------------------------------------------

program.description("Runs deployments for various application types");

deployTypes.forEach((deployType) => {
    program.command(deployType, `Run deployments for ${deployType}`); // Note: Description is required
});

program.parse(process.argv);

// #endregion Entrypoint
