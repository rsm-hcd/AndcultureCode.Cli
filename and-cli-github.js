#!/usr/bin/env node
require("./command-runner").run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Imports
    // -----------------------------------------------------------------------------------------
    const echo = require("./modules/echo");
    const github = require("./modules/github");
    const program = require("commander");

    // #endregion Imports

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option")
        .description(github.description())
        .option("-a, --add-topic <topic>", "Add topic to specified repository")
        .option("-l, --list-repos", "Lists all andculture repos")
        .option(
            "-r, --repo <repo>",
            "Repository name to act on (used in conjunction with -a or -t, for example)"
        )
        .option("-t, --get-topics", "List topics for a given repo")
        .option(
            "-u, --username <username>",
            "Github username for which to list andculture repositories"
        )
        .parse(process.argv);

    // Configure github module based on passed in args/options
    if (program.listRepos != null) {
        echo.success("AndcultureCode Repositories");
        echo.byProperty(await github.repositoriesByAndculture(), "url");
        return;
    }

    if (program.username != null) {
        echo.success(`${program.username} Repositories`);
        echo.byProperty(
            await github.repositoriesByAndculture(program.username),
            "url"
        );
        return;
    }

    if (program.getTopics != null && program.repo != null) {
        const repoName = program.repo;
        echo.message(`Topics for ${repoName}`);
        const topicsResult = await github.topicsForRepository(
            "andculturecode",
            repoName
        );
        echo.messages(topicsResult);
    }

    if (program.addTopic != null && program.repo != null) {
        const topic = program.addTopic;
        const repoName = program.repo;
        await github.addTopicToRepository(
            topic,
            github.andcultureOrg,
            repoName
        );
    }

    if (program.addTopic != null && program.repo == null) {
        const topic = program.addTopic;
        await github.addTopicToAllRepositories(topic);
    }

    // If no options are passed in, output help
    if (process.argv.slice(2).length === 0) {
        program.outputHelp();
    }

    // #endregion Entrypoint
});
