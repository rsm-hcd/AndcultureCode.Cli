#!/usr/bin/env node
require("./command-runner").run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Imports
    // -----------------------------------------------------------------------------------------
    const echo    = require("./_modules/echo");
    const github  = require("./_modules/github");
    const program = require("commander");

    // #endregion Imports

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option")
        .description(github.description())
        .option("-u, --username <username>", "Github username for which to list andculture repositories")
        .parse(process.argv);

    // Configure github module based on passed in args/options
    echo.success("AndcultureCode Repositories");
    echo.byProperty(await github.repositoriesByAndculture(), "url");

    if (program.username != null) {
        echo.success(`${program.username} Repositories`);
        echo.byProperty(await github.repositoriesByAndculture(program.username), "url");
    }

    // #endregion Entrypoint
});
