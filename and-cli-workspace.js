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

            configureNewClone(repo, prefix);

            results.successCount++;
        });

        return results;
    };

    const configureNewClone = (repo, prefix) => {
        echo.message(` - Configuring ${repo.full_name}...`);

        // Additional configuration if its a clone of a fork
        if (!repo.fork) {
            return;
        }

        const folder = git.getCloneDirectoryName(repo.name, prefix);
        shell.cd(folder);

        const addUpstreamResult = git.addRemote(
            "upstream",
            `git://github.com/AndcultureCode/${repo.name}.git`
        );

        if (addUpstreamResult) {
            echo.message(` - Configured upstream for '${repo.full_name}'`);
        }

        shell.cd("..");
    };

    const echoCloneResults = (cloneResults) => {
        echo.newLine();
        echo.message("Results");
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

        if (reposToFork.length === 0) {
            echo.message(" - No new repositories to fork.");
            return;
        }

        await js.asyncForEach(reposToFork, async (repoToFork) => {
            await github.fork(repoToFork.owner.login, repoToFork.name);
        });

        echo.newLine();
        echo.success("Successfully created all outstanding forks");
    };

    // #endregion Functions

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option")
        .description("Manage AndcultureCode projects workspace")
        .option(
            "-c, --clone",
            "Automatically clone all AndcultureCode organization repositories"
        )
        .option(
            "-f, --fork",
            "Automatically creates any missing forks of AndcultureCode repositories for the current user"
        )
        .option(
            "-u, --usernames <usernames>",
            "Comma delimited list of Github usernames for which to clone forked andculture repositories"
        )
        .parse(process.argv);

    // If no flags provided, short-circuit
    // -----------------------------------
    if (js.hasNoArguments()) {
        echo.headerError("At least one flag is required. See options below...");
        program.help();
    }

    const cloneEnabled = program.clone != null;
    const forkEnabled = program.fork != null;
    const usernamesProvided = StringUtils.hasValue(program.usernames);

    echo.header("Configuring workspace");

    // Initiate forks for authenticated user
    // -------------------------------------
    if (forkEnabled) {
        echo.message("Forking any outstanding AndcultureCode repositories...");
        await forkRepositories();
        echo.newLine();
    }

    // Clone top-level AndcultureCode repositories
    // -------------------------------------------
    if (cloneEnabled) {
        echo.message("Synchronizing AndcultureCode repositories...");
        const repos = await github.repositoriesByAndculture();
        const cloneResults = cloneRepositories(repos);
        echoCloneResults(cloneResults);
        echo.newLine();
    }

    // Clone user forks of AndcultureCode repositories
    // -----------------------------------------------
    if (usernamesProvided) {
        await cloneForUsers(program.usernames);
        echo.newLine();
    }

    // #endregion Entrypoint
});
