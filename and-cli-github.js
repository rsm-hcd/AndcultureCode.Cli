#!/usr/bin/env node

require("./command-runner").run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Imports
    // -----------------------------------------------------------------------------------------

    const { StringUtils } = require("andculturecode-javascript-core");
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
        .option("--add-topic <topic>", "Add topic to specified repository")
        .option("-l, --list-repos", "Lists all andculture repos")
        .option("--remove-topic <topic>", "Add topic to specified repository")
        .option(
            "-r, --repo <repo>",
            "Repository name to act on (used in conjunction with --add-topic or --get-topics, for example)"
        )
        .option("--get-topics", "List topics for a given repo")
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
            github.andcultureOrg,
            repoName
        );
        echo.messages(topicsResult);
        return;
    }

    if (program.addTopic != null) {
        if (StringUtils.isEmpty(program.repo)) {
            await github.addTopicToAllRepositories(program.addTopic);
            return;
        }

        await github.addTopicToRepository(
            program.addTopic,
            github.andcultureOrg,
            program.repo
        );
        return;
    }

    if (program.removeTopic != null) {
        if (StringUtils.isEmpty(program.repo)) {
            await github.removeTopicFromAllRepositories(program.removeTopic);
            return;
        }

        await github.removeTopicFromRepository(
            program.removeTopic,
            github.andcultureOrg,
            program.repo
        );
        return;
    }

    // If no options are passed in, output help
    if (process.argv.slice(2).length === 0) {
        program.outputHelp();
    }

    // #endregion Entrypoint
});
