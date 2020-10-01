#!/usr/bin/env node

const { ShellString } = require("shelljs");

require("./command-runner").run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Imports
    // -----------------------------------------------------------------------------------------
    const echo = require("./modules/echo");
    const formatters = require("./modules/formatters");
    const git = require("./modules/git");
    const github = require("./modules/github");
    const js = require("./modules/js");
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

    const cloneByUser = async (username) => {
        echo.message(
            `Synchronizing forks of AndcultureCode for '${username}'...`
        );
        const userRepos = await github.repositoriesByAndculture(username);
        const cloneUserResults = cloneRepositories(userRepos, username);
        echoCloneResults(cloneUserResults);
    };

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
            if (git.isCloned(repo.name, prefix)) {
                results.unmodifiedCount++;
                return;
            }

            if (!git.clone(repo.name, repo.ssh_url, prefix)) {
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
            "-f, --fork",
            "Automatically forks AndcultureCode repositories for authenticated user"
        )
        .option(
            "-u, --usernames <usernames>",
            "Comma delimited list of Github usernames for which to clone forked andculture repositories"
        )
        .parse(process.argv);

    echo.header("Configuring workspace");

    // Clone top-level AndcultureCode repositories
    // -------------------------------------------
    echo.message("Synchronizing AndcultureCode repositories...");
    const repos = await github.repositoriesByAndculture();
    const cloneResults = cloneRepositories(repos);
    echoCloneResults(cloneResults);

    echo.newLine();

    // Clone user forks of AndcultureCode repositories
    // -----------------------------------------------
    if (program.usernames != null) {
        const usernames = program.usernames.split(",");

        await js.asyncForEach(usernames, async (username) => {
            await cloneByUser(username);
            echo.newLine();
        });
    }

    // #endregion Entrypoint
});
