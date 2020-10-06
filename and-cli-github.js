#!/usr/bin/env node

require("./command-runner").run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Imports
    // -----------------------------------------------------------------------------------------

    const { StringUtils } = require("andculturecode-javascript-core");
    const constants = require("./modules/constants");
    const echo = require("./modules/echo");
    const github = require("./modules/github");
    const js = require("./modules/js");
    const program = require("commander");

    // #endregion Imports

    // -----------------------------------------------------------------------------------------
    // #region Constants
    // -----------------------------------------------------------------------------------------

    const { ANDCULTURE_CODE } = constants;

    // #endregion Constants

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option")
        .description(github.description())
        .option(
            "--add-topic <topic>",
            `Add topic to specified repository, or all ${ANDCULTURE_CODE} repositories if no repo provided`
        )
        .option("--list-repos", "Lists all andculture repos")
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
    if (js.hasNoArguments()) {
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

    if (listAndcultureRepos) {
        echo.success(`${ANDCULTURE_CODE} Repositories`);
        echo.byProperty(await github.repositoriesByAndculture(), "url");
        return;
    }

    if (listReposByUser) {
        echo.success(`${program.username}/${ANDCULTURE_CODE} Repositories`);
        echo.byProperty(
            await github.repositoriesByAndculture(program.username),
            "url"
        );
        return;
    }

    if (listTopicsByRepo) {
        const repoName = program.repo;
        echo.success(`Topics for ${repoName}`);
        const topicsResult = await github.topicsForRepository(
            github.andcultureOrg,
            repoName
        );
        echo.message(topicsResult.join(", "));
        return;
    }

    if (addTopicToAllRepos) {
        await github.addTopicToAllRepositories(program.addTopic);
        return;
    }

    if (addTopicToRepo) {
        await github.addTopicToRepository(
            program.addTopic,
            github.andcultureOrg,
            program.repo
        );
        return;
    }

    if (removeTopicFromAllRepos) {
        await github.removeTopicFromAllRepositories(program.removeTopic);
        return;
    }

    if (removeTopicFromRepo) {
        await github.removeTopicFromRepository(
            program.removeTopic,
            github.andcultureOrg,
            program.repo
        );
        return;
    }

    // If no valid combination of options were passed in, output help and exit
    program.help();

    // #endregion Entrypoint
});
