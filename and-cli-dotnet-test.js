#!/usr/bin/env node
require("./command-runner").run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Imports
    // -----------------------------------------------------------------------------------------
    const dotnetTest = require("./_modules/dotnet-test");
    const program    = require("commander");

    // #endregion Imports

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option")
        .description(dotnetTest.description())
        .option("--by-project",     "Runs all test projects for the solution serially")
        .option("--ci",             "Runs the command in a 'ci' (continuous integration) mode, which provides a summary of failed test projects (only effects --by-project mode)")
        .option("--coverage",       "Additionally run tests with code coverage via coverlet")
        .option("-s, --skip-clean", "Skips the clean, build, and restore steps before running the dotnet test runner. This will speed up sequential runs if intentionally running on the same assemblies.")
        .parse(process.argv);

    // Configure dotnetTest module based on passed in args/options
    dotnetTest
        .ciMode(program.ci)
        .filter(program.args)
        .skipClean(program.skipClean)
        .withCoverage(program.coverage);

    if (program.byProject === true) {
        dotnetTest.runSolutionByProject();
    }

    if (program.byProject == null || !program.byProject) {
        dotnetTest.runBySolution();
    }

    // #endregion Entrypoint
});
