#!/usr/bin/env node

/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const { spawn, spawnSync } = require("child_process");
const dir                  = require("./_modules/dir");
const dotnetBuild          = require("./_modules/dotnet-build");
const dotnetPath           = require("./_modules/dotnet-path");
const echo                 = require("./_modules/echo");
const dotnetTest           = require("./_modules/dotnet-test");
const program              = require("commander");
const shell                = require("shelljs");

/**************************************************************************************************
 * Variables
 **************************************************************************************************/

const coverageFlags = "-p:CollectCoverage=true -p:CoverletOutputFormat=opencover";

/**************************************************************************************************
 * Commands
 **************************************************************************************************/

// #region Commands

// const dotnetTest = {
//     cmd: "dotnet test --no-build --no-restore",
//     descriptionSkipClean() {
//         return "Skips the clean, build, and restore steps before running the dotnet test runner. This will speed up sequential runs if intentionally running on the same assemblies.";
//     },
//     description() {
//         return `Runs dotnet test runner on the ${dotnetPath.solutionPath()} solution (via ${this.cmd})`;
//     },
//     /**
//      * Runs dotnet test synchronously for the given test project
//      *
//      * @param {string} project The name of the test project to be run.
//      * @param {(boolean | undefined)} ciMode Determines whether the command is being run by a continuous integration process
//      * @param {(boolean | undefined)} withCoverage Determines whether the command should collect code coverage results from the test run.
//      * @param {(string[] | undefined)} filter An array of string
//      * @returns {any} An object containing the project name, exit code, and stdout/stderr if 'ciMode' is true.
//      * @example
//      * // An example of the result object to be returned. Code = 0 signifies a successful run,
//      * // while any other code signifies a failure.
//      *  {
//             code: 1,
//             name: "ExampleProject.Core.Tests",
//             stderr: "...",
//             stdout: "...",
//         }
//      */
//     runProject(project, ciMode, withCoverage, filter) {
//         // Since the spawnSync function takes the base command and all arguments separately, we cannot
//         // leverage the base dotnet test command string here. We'll build out the arg list in an array.

//         const cmd = "dotnet";
//         const args = ["test", "--no-build", "--no-restore"];

//         if (withCoverage) {
//             // The two coverage flags need to be pushed onto the args array before the project name
//             // it seems. The dotnet command was not recognizing them at the end of the args array.
//             args.push(coverageFlags);
//         }

//         let message = `Running tests in the ${project} project... via (${cmd} ${args.join(" ")} ${project})`;

//         if (filter != null && filter.length > 0) {
//             args.push("--filter", filter);
//             message = `Running tests in the ${project} project that match the xunit filter of '${filter}' via (${cmd} ${args.join(" ")} ${project})`;
//         }

//         // Push the project name on as the last arg in the array
//         args.push(project);

//         echo.message(message);

//         // Determine the stdio mode based on whether or not this is being run in ci mode.
//         // If in ci mode, we need to pipe output to capture stdout/stderr for the output summary.
//         const stdioMode = ciMode ? "pipe" : "inherit";
//         const result = spawnSync(cmd, args, { stdio: stdioMode, shell: true });

//         // We only need to manually output stdout/stderr in ci mode since we're piping it.
//         // For regular use, stdout/stderr will be inherited and output automatically.
//         if (ciMode) {
//             echo.message(result.stdout);

//             if (result.stderr != null && result.stderr.length > 0) {
//                 echo.error(result.stderr);
//             }
//         }

//         return {
//             code: result.status,
//             name: project,
//             stderr: result.stderr,
//             stdout: result.stdout,
//         };
//     },
//     runSolutionByProject(skipClean) {
//         // Check for the solution path before attempting any work
//         dotnetPath.solutionPathOrExit();

//         if (!skipClean) {
//             dotnetBuild.run(true, true);
//         }

//         const solutionDir = dotnetPath.solutionDir();
//         dir.pushd(solutionDir);

//         const testProjects = shell.find("**/*.Test*.csproj");
//         if (testProjects == null || testProjects.length === 0) {
//             echo.error("Could not find any csproj files matching the pattern *.Test*.csproj.");
//             shell.exit(1);
//         }

//         echo.message(`Found ${testProjects.length} test projects in the ${dotnetPath.solutionDir()} solution...`);

//         // Call runProject() for each project found that matches the pattern. This will return an object containing
//         // the project name, exit status and stdout/stderr (if in ci mode)
//         const results = testProjects.map((testProject) => this.runProject(testProject, program.ci, program.coverage, program.args));

//         // Check the results array for any non-zero exit codes and display helpful output for each
//         const failedProjects = results.filter((testResult) => testResult.code !== 0);
//         if (failedProjects.length === 0) {
//             dir.popd();
//             echo.newLine();
//             echo.message("Exited dotnet-test");
//             shell.exit(0);
//         }

//         failedProjects.forEach((testResult) => {
//             if (program.ci) {
//                 echo.headerError(`Failed tests for ${testResult.name}`);
//                 echo.error(testResult.stderr);

//                 return;
//             }

//             echo.error(`Tests failed for ${testResult.name}. Scroll up or search the output for the project name for more detail.`);
//         });

//         echo.error(`${failedProjects.length} test projects exited with non-zero exit status. See above output for more detail.`);
//         shell.exit(1);
//     },
//     runBySolution(skipClean) {
//         // Check for the solution path before attempting any work
//         dotnetPath.solutionPathOrExit();

//         if (!skipClean) {
//             dotnetBuild.run(true, true);
//         }

//         const solutionDir = dotnetPath.solutionDir();

//         dir.pushd(solutionDir);

//         // Copy over base dotnet test command & args to chain on additional args and apply conditional messaging
//         let cmd = this.cmd;

//         if (program.coverage) {
//             cmd = `${cmd} ${coverageFlags}`;
//         }

//         let message = `Running all tests in the ${dotnetPath.solutionPath()} solution... via (${cmd})`;

//         if (program.args.length > 0) {
//             const filter = program.args;
//             cmd = `${cmd} --filter ${filter}`;
//             message = `Running tests in the ${dotnetPath.solutionPath()} solution that match the xunit filter of '${filter}' via (${cmd})`;
//         }

//         echo.message(message);

//         const child = spawn(cmd, { stdio: "inherit", shell: true });
//         child.on("exit", (code, signal) => {
//             if (code !== 0) {
//                 echo.error(`Exited with error '${signal ? signal : code}'`);
//                 shell.exit(code);
//             }

//             dir.popd();
//             echo.newLine();
//             echo.message("Exited dotnet-test");
//         });
//     },
// };

// #endregion Commands


/**************************************************************************************************
 * Entrypoint / Command router
 **************************************************************************************************/

// #region Entrypoint / Command router

program
    .usage("option")
    .description(dotnetTest.description())
    .option("--by-project", "Runs all test projects for the solution serially")
    .option("--ci", "Runs the command in a 'ci' (continuous integration) mode, which provides a summary of failed test projects (only effects --by-project mode)")
    .option("--coverage",  "Additionally run tests with code coverage via coverlet")
    .option("-s, --skip-clean", "Skips the clean, build, and restore steps before running the dotnet test runner. This will speed up sequential runs if intentionally running on the same assemblies.")
    .parse(process.argv);

// Configure dotnetTest module based on passed in args/options
dotnetTest
    .ciMode(program.ciMode)
    .filter(program.args)
    .skipClean(program.skipClean)
    .withCoverage(program.coverage);

if (program.byProject === true) {
    dotnetTest.runSolutionByProject();
}

if (program.byProject == null || !program.byProject) {
    dotnetTest.runBySolution();
}

// #endregion Entrypoint / Command router

exports.dotnetTest = dotnetTest;
