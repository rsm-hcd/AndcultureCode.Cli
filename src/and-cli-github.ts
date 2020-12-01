#!/usr/bin/env node

import { CommandRunner } from "./modules/command-runner";
import { StringUtils } from "andculturecode-javascript-core";
import { Constants } from "./modules/constants";
import { Echo } from "./modules/echo";
import { Github } from "./modules/github";
import { Js } from "./modules/js";
import program from "commander";

CommandRunner.run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Constants
    // -----------------------------------------------------------------------------------------

    const { ANDCULTURE_CODE } = Constants;

    // #endregion Constants

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option")
        .description(Github.description())
        .option(
            "--add-topic <topic>",
            `Add topic to specified repository, or all ${ANDCULTURE_CODE} repositories if no repo provided`
        )
        .option(
            "--auth",
            "Authenticate any github API requests. Can help avoid API limits"
        )
        .option("--list-repos", `Lists all ${ANDCULTURE_CODE} repos`)
        .option(
            "--list-topics",
            "List topics for a given repo (used in conjunction with --repo)"
        )
        .option(
            "--remove-topic <topic>",
            `Remove topic from specified repository, or all ${ANDCULTURE_CODE} repositories if no repo provided`
        )
        .option(
            "-r, --repo <repo>",
            "Repository name to act on (used in conjunction with --add-topic or --list-topics, for example)."
        )
        .option(
            "-u, --username <username>",
            `Github username for which to list ${ANDCULTURE_CODE} repositories`
        )
        .parse(process.argv);

    // If no options are passed in, output help and exit
    if (Js.hasNoArguments()) {
        program.help();
    }

    // Configure github module based on passed in args/options
    const listAndcultureRepos = program.listRepos != null;
    const listReposByUser = program.username != null;
    const listTopicsByRepo =
        program.listTopics != null && StringUtils.hasValue(program.repo);
    const addTopicToAllRepos =
        StringUtils.hasValue(program.addTopic) &&
        StringUtils.isEmpty(program.repo);
    const addTopicToRepo =
        StringUtils.hasValue(program.addTopic) &&
        StringUtils.hasValue(program.repo);
    const removeTopicFromAllRepos =
        StringUtils.hasValue(program.removeTopic) &&
        StringUtils.isEmpty(program.repo);
    const removeTopicFromRepo =
        StringUtils.hasValue(program.removeTopic) &&
        StringUtils.hasValue(program.repo);

    if (program.auth != null) {
        await Github.getToken();
    }

    if (listAndcultureRepos) {
        Echo.success(`${ANDCULTURE_CODE} Repositories`);
        Echo.byProperty(await Github.repositoriesByAndculture(), "url");
        return;
    }

    if (listReposByUser) {
        Echo.success(`${program.username}/${ANDCULTURE_CODE} Repositories`);
        Echo.byProperty(
            await Github.repositoriesByAndculture(program.username),
            "url"
        );
        return;
    }

    if (listTopicsByRepo) {
        const repoName = program.repo;
        Echo.success(`Topics for ${repoName}`);
        const topicsResult = await Github.topicsForRepository(
            Github.andcultureOrg,
            repoName
        );
        Echo.message(topicsResult?.join(", "));
        return;
    }

    if (addTopicToAllRepos) {
        await Github.addTopicToAllRepositories(program.addTopic);
        return;
    }

    if (addTopicToRepo) {
        await Github.addTopicToRepository(
            program.addTopic,
            Github.andcultureOrg,
            program.repo
        );
        return;
    }

    if (removeTopicFromAllRepos) {
        await Github.removeTopicFromAllRepositories(program.removeTopic);
        return;
    }

    if (removeTopicFromRepo) {
        await Github.removeTopicFromRepository(
            program.removeTopic,
            Github.andcultureOrg,
            program.repo
        );
        return;
    }

    // If no valid combination of options were passed in, output help and exit
    program.help();

    // #endregion Entrypoint
});
