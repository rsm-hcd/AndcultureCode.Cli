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
        .option("-t, --get-topics <repo>", "Repository name to list topics for")
        .option("-r, --repos", "Lists all andculture repos")
        .option(
            "-u, --username <username>",
            "Github username for which to list andculture repositories"
        )
        .parse(process.argv);

    // Configure github module based on passed in args/options
    if (program.repos != null) {
        echo.success("AndcultureCode Repositories");
        echo.byProperty(await github.repositoriesByAndculture(), "url");
    }

    if (program.username != null) {
        echo.success(`${program.username} Repositories`);
        echo.byProperty(
            await github.repositoriesByAndculture(program.username),
            "url"
        );
    }

    if (program.getTopics != null) {
        const repoName = program.getTopics;
        echo.message(`Topics for ${repoName}`);
        const topicsResult = await github.topicsForRepository(
            "andculturecode",
            repoName
        );
        echo.messages(topicsResult);
    }

    // #endregion Entrypoint
});
