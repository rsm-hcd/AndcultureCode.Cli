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
    const { StringUtils } = require("andculturecode-javascript-core");

    // #endregion Imports

    // -----------------------------------------------------------------------------------------
    // #region Variables
    // -----------------------------------------------------------------------------------------

    const { red, yellow } = formatters;

    // #endregion Variables

    // -----------------------------------------------------------------------------------------
    // #region Functions
    // -----------------------------------------------------------------------------------------

    const cloneForUser = async (username) => {
        echo.message(
            `Synchronizing forks of AndcultureCode for '${username}'...`
        );
        const userRepos = await github.repositoriesByAndculture(username);
        const cloneUserResults = cloneRepositories(userRepos, username);
        echoCloneResults(cloneUserResults);
    };

    const cloneForUsers = async (usernames) => {
        usernames = usernames.split(",");

        await js.asyncForEach(usernames, async (username) => {
            await cloneForUser(username.trim());
            echo.newLine();
        });
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

    const forkRepositories = async () => {
        const user = await github.getCurrentUser();
        const repos = await github.repositoriesByAndculture();
        const userRepos = await github.repositoriesByAndculture(user.login);
        const userForks = userRepos.filter((userRepo) => userRepo.fork);

        // Find user's forks that do NOT start with the top-level repos name
        // NOTE: unfortunately there is not a more concrete way to identify a fork (ie. full_name equality checking)
        const reposToFork = repos.filter((repo) =>
            userForks.every((userFork) => !userFork.name.startsWith(repo.name))
        );

        reposToFork.forEach((repoToFork) => {
            echo.success(`Initiating fork of '${repoToFork.full_name}'...`);
        });
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
            "Automatically creates any missing forks of AndcultureCode repositories for the current user"
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
    if (StringUtils.hasValue(program.usernames)) {
        await cloneForUsers(program.usernames);
    }

    // Initiate forks for authenticated user
    // -------------------------------------
    if (program.fork != null) {
        await forkRepositories();
    }

    // #endregion Entrypoint
});
