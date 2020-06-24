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
        .parse(process.argv);

    // Configure github module based on passed in args/options
    echo.success("AndcultureCode Repositories");
    echo.byProperty(await github.repositoriesByAndculture(), "url");

    echo.success("Your Repositories");
    echo.byProperty(await github.repositoriesByAndculture("wintondeshong"), "url");

    // #endregion Entrypoint
});
