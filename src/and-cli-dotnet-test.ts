#!/usr/bin/env node

import { DotnetTest } from "./modules/dotnet-test";
import { CommandRunner } from "./modules/command-runner";
import program from "commander";

CommandRunner.run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option")
        .description(DotnetTest.description())
        .option(
            "--by-project",
            "Runs all test projects for the solution serially"
        )
        .option(
            "--ci",
            "Runs the command in a 'ci' (continuous integration) mode, which provides a summary of failed test projects (only affects --by-project mode)"
        )
        .option(
            "--coverage",
            "Additionally run tests with code coverage via coverlet"
        )
        .option(
            "-s, --skip-clean",
            "Skips the clean, build, and restore steps before running the dotnet test runner. This will speed up sequential runs if intentionally running on the same assemblies."
        )
        .option(
            "-w, --watch",
            "Run dotnet test in watch mode. Will only work when run on a single project (.csproj)."
        )
        .parse(process.argv);

    // Configure DotnetTest module based on passed in args/options
    DotnetTest.ciMode(program.ci)
        .filter(program.args)
        .skipClean(program.skipClean)
        .watchMode(program.watch)
        .withCoverage(program.coverage);

    if (program.byProject === true) {
        DotnetTest.runSolutionByProject();
    }

    if (program.byProject == null || !program.byProject) {
        DotnetTest.runBySolution();
    }

    // #endregion Entrypoint
});
