#!/usr/bin/env node

const { ShellString } = require("shelljs");

require("./command-runner").run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Imports
    // -----------------------------------------------------------------------------------------
    const echo = require("./modules/echo");
    const formatters = require("./modules/formatters");
    const fs = require("fs");
    const github = require("./modules/github");
    const program = require("commander");
    const shell = require("shelljs");

    // #endregion Imports

    // -----------------------------------------------------------------------------------------
    // #region Variables
    // -----------------------------------------------------------------------------------------

    const { red, yellow } = formatters;

    // #endregion Variables

    // -----------------------------------------------------------------------------------------
    // #region Functions
    // -----------------------------------------------------------------------------------------

    // TODO: Extract and refactor into git module
    const cloneRepositories = (repositories, prefix) => {
        const results = {
            errorCount: 0,
            successCount: 0,
            totalCount: 0,
            unmodifiedCount: 0,
        };

        if (repositories == null || repositories.length == 0) {
            return results;
        }

        results.totalCount = repositories.length;

        repositories.forEach((repo) => {
            const folder =
                prefix != null ? `${prefix}.${repo.name}` : repo.name;

            if (fs.existsSync(folder)) {
                results.unmodifiedCount++;
                return;
            }

            if (shell.exec(`git clone ${repo.ssh_url} ${folder}`).code !== 0) {
                echo.error(`Failed to clone '${repo.name}'. Skipping...`);
                results.errorCount++;
                return;
            }

            echo.success(`Cloned '${repo.full_name}'`);
            results.successCount++;
        });

        return results;
    };

    const echoCloneResults = (cloneResults) => {
        echo.success(` - Successful: ${cloneResults.successCount}`);
        echo.message(yellow(` - Unmodified: ${cloneResults.unmodifiedCount}`));
        echo.message(red(` - Errored: ${cloneResults.errorCount}`));
        echo.message(` - Total: ${cloneResults.totalCount}`);
    };

    // #endregion Functions

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option")
        .description("Manage AndcultureCode projects workspace")
        .option(
            "-u, --username <username>",
            "Github username for which to fork andculture repositories"
        )
        .parse(process.argv);

    echo.header("Configuring workspace");

    echo.message("Cloning AndcultureCode repositories...");
    const repos = await github.repositoriesByAndculture();
    const cloneResults = cloneRepositories(repos);
    echoCloneResults(cloneResults);

    echo.newLine();

    const username = program.username;
    if (username != null) {
        echo.message(`Cloning forks of AndcultureCode for '${username}'...`);
        const userRepos = await github.repositoriesByAndculture(username);
        const cloneUserResults = cloneRepositories(userRepos, username);
        echoCloneResults(cloneUserResults);
    }

    // #endregion Entrypoint
});
