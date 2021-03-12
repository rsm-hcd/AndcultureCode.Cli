#!/usr/bin/env node

import { Git } from "./modules/git";
import { Github } from "./modules/github";
import { Echo } from "./modules/echo";
import { Formatters } from "./modules/formatters";
import { CommandRunner } from "./modules/command-runner";
import { CollectionUtils, StringUtils } from "andculturecode-javascript-core";
import { Js } from "./modules/js";
import shell from "shelljs";
import program from "commander";
import { Repository } from "./interfaces/github/repository";

// -----------------------------------------------------------------------------------------
// #region Interfaces
// -----------------------------------------------------------------------------------------

interface CloneRepositoriesResult {
    errorCount: number;
    successCount: number;
    totalCount: number;
    unmodifiedCount: number;
}

// #endregion Interfaces

CommandRunner.run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Functions
    // -----------------------------------------------------------------------------------------

    const cloneForUser = async (username: string) => {
        Echo.message(
            `Synchronizing forks of AndcultureCode for '${username}'...`
        );
        const userRepos = await Github.repositoriesByAndculture(username);
        const cloneUserResults = cloneRepositories(userRepos, username);

        echoCloneResults(cloneUserResults);
    };

    const cloneForUsers = async (usernames: string) => {
        const usernameArray = usernames.split(",");

        await Js.asyncForEach(usernameArray, async (username: string) => {
            await cloneForUser(username.trim());
            Echo.newLine();
        });
    };

    const cloneRepositories = (
        repositories?: Repository[],
        prefix?: string
    ): CloneRepositoriesResult => {
        const results: CloneRepositoriesResult = {
            errorCount: 0,
            successCount: 0,
            totalCount: 0,
            unmodifiedCount: 0,
        };

        if (CollectionUtils.isEmpty(repositories)) {
            return results;
        }

        results.totalCount = repositories!.length;

        repositories!.forEach((repo: Repository) => {
            if (Git.isCloned(repo.name, prefix)) {
                results.unmodifiedCount++;
                return;
            }

            if (!Git.clone(repo.name, repo.ssh_url, prefix)) {
                results.errorCount++;
                return;
            }

            Echo.success(`Cloned '${repo.full_name}'`);

            configureNewClone(repo, prefix);

            results.successCount++;
        });

        return results;
    };

    const configureNewClone = (repo: Repository, prefix?: string) => {
        Echo.message(` - Configuring ${repo.full_name}...`);

        // Additional configuration if its a clone of a fork
        if (!repo.fork) {
            return;
        }

        const folder = Git.getCloneDirectoryName(repo.name, prefix);
        shell.cd(folder);

        const addUpstreamResult = Git.addRemote(
            "upstream",
            `git://github.com/AndcultureCode/${repo.name}.git`
        );

        if (addUpstreamResult) {
            Echo.message(` - Configured upstream for '${repo.full_name}'`);
        }

        shell.cd("..");
    };

    const echoCloneResults = (cloneResults: CloneRepositoriesResult) => {
        Echo.newLine();
        Echo.message("Results");
        Echo.success(` - Successful: ${cloneResults.successCount}`);
        Echo.message(
            Formatters.yellow(` - Unmodified: ${cloneResults.unmodifiedCount}`)
        );
        Echo.message(Formatters.red(` - Errored: ${cloneResults.errorCount}`));
        Echo.message(` - Total: ${cloneResults.totalCount}`);
    };

    const forkRepositories = async () => {
        const user = await Github.getCurrentUser();
        const repos = await Github.repositoriesByAndculture();
        const userRepos = await Github.repositoriesByAndculture(user.login);
        const userForks = userRepos?.filter(
            (userRepo: Repository) => userRepo.fork
        );

        // Find user's forks that do NOT start with the top-level repos name
        // NOTE: unfortunately there is not a more concrete way to identify a fork (ie. full_name equality checking)
        const reposToFork =
            repos?.filter((repo: Repository) =>
                userForks?.every(
                    (userFork: Repository) =>
                        !userFork.name.startsWith(repo.name)
                )
            ) ?? [];

        if (CollectionUtils.isEmpty(userForks)) {
            Echo.message(" - No new repositories to fork.");
            return;
        }

        await Js.asyncForEach(reposToFork, async (repoToFork: Repository) => {
            await Github.fork(repoToFork.owner.login, repoToFork.name);
        });

        Echo.newLine();
        Echo.success("Successfully created all outstanding forks");
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
    if (Js.hasNoArguments()) {
        Echo.headerError("At least one flag is required. See options below...");
        program.help();
    }

    const cloneEnabled = program.clone != null;
    const forkEnabled = program.fork != null;
    const usernamesProvided = StringUtils.hasValue(program.usernames);

    Echo.header("Configuring workspace");

    // Initiate forks for authenticated user
    // -------------------------------------
    if (forkEnabled) {
        Echo.message("Forking any outstanding AndcultureCode repositories...");
        await forkRepositories();
        Echo.newLine();
    }

    // Clone top-level AndcultureCode repositories
    // -------------------------------------------
    if (cloneEnabled) {
        Echo.message("Synchronizing AndcultureCode repositories...");
        const repos = await Github.repositoriesByAndculture();
        const cloneResults = cloneRepositories(repos);
        echoCloneResults(cloneResults);
        Echo.newLine();
    }

    // Clone user forks of AndcultureCode repositories
    // -----------------------------------------------
    if (usernamesProvided) {
        await cloneForUsers(program.usernames);
        Echo.newLine();
    }

    // #endregion Entrypoint
});
