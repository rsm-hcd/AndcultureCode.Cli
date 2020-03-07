#!/usr/bin/env node

/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const { spawn, spawnSync } = require("child_process");
const dir                  = require("./dir");
const dotnetBuild          = require("./dotnet-build");
const dotnetPath           = require("./dotnet-path");
const echo                 = require("./echo");
const program              = require("commander");
const shell                = require("shelljs");

/**************************************************************************************************
 * Constants
 **************************************************************************************************/

const COVERAGE_FLAGS = "-p:CollectCoverage=true -p:CoverletOutputFormat=opencover";

/**************************************************************************************************
 * Variables
 **************************************************************************************************/

 let _ciMode = false;
 let _filter = [];
 let _skipClean = false;
 let _withCoverage = false;

/**************************************************************************************************
 * Functions
 **************************************************************************************************/

const dotnetTest = {
    ciMode(ciMode) {
        if (ciMode != null) {
            _ciMode = ciMode;
        }

        return this;
    },
    cmd: "dotnet test --no-build --no-restore",
    description() {
        return `Runs dotnet test runner on the ${dotnetPath.solutionPath()} solution (via ${this.cmd})`;
    },
    filter(filter) {
        if (filter != null) {
            _filter = filter;
        }

        return this;
    },
    /**
     * Runs dotnet test synchronously for the given test project
     *
     * @param {string} project The name of the test project to be run.
     * @returns {any} An object containing the project name, exit code, and stdout/stderr if 'ciMode' is true.
     * @example
     * // An example of the result object to be returned. Code = 0 signifies a successful run,
     * // while any other code signifies a failure.
     *  {
            code: 1,
            name: "ExampleProject.Core.Tests",
            stderr: "...",
            stdout: "...",
        }
     */
    runProject(project) {
        // Since the spawnSync function takes the base command and all arguments separately, we cannot
        // leverage the base dotnet test command string here. We'll build out the arg list in an array.

        const cmd = "dotnet";
        const args = ["test", "--no-build", "--no-restore"];

        if (_withCoverage) {
            // The two coverage flags need to be pushed onto the args array before the project name
            // it seems. The dotnet command was not recognizing them at the end of the args array.
            args.push(COVERAGE_FLAGS);
        }

        let message = `Running tests in the ${project} project... via (${cmd} ${args.join(" ")} ${project})`;

        if (_filter != null && _filter.length > 0) {
            args.push("--filter", _filter);
            message = `Running tests in the ${project} project that match the xunit filter of '${_filter}' via (${cmd} ${args.join(" ")} ${project})`;
        }

        // Push the project name on as the last arg in the array
        args.push(project);

        echo.message(message);

        // Determine the stdio mode based on whether or not this is being run in ci mode.
        // If in ci mode, we need to pipe output to capture stdout/stderr for the output summary.
        const stdioMode = _ciMode ? "pipe" : "inherit";
        const result = spawnSync(cmd, args, { stdio: stdioMode, shell: true });

        // We only need to manually output stdout/stderr in ci mode since we're piping it.
        // For regular use, stdout/stderr will be inherited and output automatically.
        if (_ciMode) {
            echo.message(result.stdout);

            if (result.stderr != null && result.stderr.length > 0) {
                echo.error(result.stderr);
            }
        }

        return {
            code: result.status,
            name: project,
            stderr: result.stderr,
            stdout: result.stdout,
        };
    },
    runSolutionByProject() {
        // Check for the solution path before attempting any work
        dotnetPath.solutionPathOrExit();

        if (!_skipClean) {
            dotnetBuild.run(true, true);
        }

        const solutionDir = dotnetPath.solutionDir();
        dir.pushd(solutionDir);

        const testProjects = shell.find("**/*.Test*.csproj");
        if (testProjects == null || testProjects.length === 0) {
            echo.error("Could not find any csproj files matching the pattern *.Test*.csproj.");
            shell.exit(1);
        }

        echo.message(`Found ${testProjects.length} test projects in the ${dotnetPath.solutionDir()} solution...`);

        // Call runProject() for each project found that matches the pattern. This will return an object containing
        // the project name, exit status and stdout/stderr (if in ci mode)
        const results = testProjects.map((testProject) => this.runProject(testProject));

        // Check the results array for any non-zero exit codes and display helpful output for each
        const failedProjects = results.filter((testResult) => testResult.code !== 0);
        if (failedProjects.length === 0) {
            dir.popd();
            echo.newLine();
            echo.message("Exited dotnet-test");
            shell.exit(0);
        }

        failedProjects.forEach((testResult) => {
            if (_ciMode) {
                echo.headerError(`Failed tests for ${testResult.name}`);
                echo.error(testResult.stderr);

                return;
            }

            echo.error(`Tests failed for ${testResult.name}. Scroll up or search the output for the project name for more detail.`);
        });

        echo.error(`${failedProjects.length} test projects exited with non-zero exit status. See above output for more detail.`);
        shell.exit(1);
    },
    runBySolution() {
        // Check for the solution path before attempting any work
        dotnetPath.solutionPathOrExit();

        if (!_skipClean) {
            dotnetBuild.run(true, true);
        }

        const solutionDir = dotnetPath.solutionDir();

        dir.pushd(solutionDir);

        // Copy over base dotnet test command & args to chain on additional args and apply conditional messaging
        let cmd = this.cmd;

        if (program.coverage) {
            cmd = `${cmd} ${COVERAGE_FLAGS}`;
        }

        let message = `Running all tests in the ${dotnetPath.solutionPath()} solution... via (${cmd})`;

        if (_filter != null && _filter.length > 0) {
            cmd = `${cmd} --filter ${_filter}`;
            message = `Running tests in the ${dotnetPath.solutionPath()} solution that match the xunit filter of '${_filter}' via (${cmd})`;
        }

        echo.message(message);

        const child = spawn(cmd, { stdio: "inherit", shell: true });
        child.on("exit", (code, signal) => {
            if (code !== 0) {
                echo.error(`Exited with error '${signal || code}'`);
                shell.exit(code);
            }

            dir.popd();
            echo.newLine();
            echo.message("Exited dotnet-test");
        });
    },
    skipClean(skipClean) {
        if (skipClean != null) {
            _skipClean = skipClean;
        }

        return this;
    },
    withCoverage(withCoverage) {
        if (withCoverage != null) {
            _withCoverage = withCoverage;
        }

        return this;
    }
};

module.exports = dotnetTest;
