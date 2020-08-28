// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const {
    CollectionUtils,
    StringUtils,
} = require("andculturecode-javascript-core");
const child_process = require("child_process");
const commandStringFactory = require("../utilities/command-string-factory");
const dir = require("./dir");
const dotnetBuild = require("./dotnet-build");
const dotnetPath = require("./dotnet-path");
const echo = require("./echo");
const optionStringFactory = require("../utilities/option-string-factory");
const shell = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const BASE_COMMAND_STRING = commandStringFactory.build(
    "dotnet",
    "test",
    "--no-build",
    "--no-restore"
);
const COVERAGE_FLAGS =
    "-p:CollectCoverage=true -p:CoverletOutputFormat=opencover";

// OptionStrings must be defined before object containing them (DOTNET_TEST_OPTIONS)
const BY_PROJECT_OPTION_STRING = optionStringFactory.build("by-project");
const CI_OPTION_STRING = optionStringFactory.build("ci");
const COVERAGE_OPTION_STRING = optionStringFactory.build("coverage");
const SKIP_CLEAN_OPTION_STRING = optionStringFactory.build("skip-clean", "s");

const DOTNET_TEST_OPTIONS = {
    BY_PROJECT: BY_PROJECT_OPTION_STRING,
    CI: CI_OPTION_STRING,
    COVERAGE: COVERAGE_OPTION_STRING,
    SKIP_CLEAN: SKIP_CLEAN_OPTION_STRING,
};

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

let _ciMode = false;
let _filter = [];
let _skipClean = false;
let _withCoverage = false;

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

/**
 * Builds out the final command string based on configured variables in this module
 *
 * If no project is provided, it assumes we are running the entire solution.
 *
 * @param {string} [project=""]
 */
const _buildCommandString = (project = "") => {
    const { cmd } = BASE_COMMAND_STRING;
    // Clone the args from the base command so we aren't manipulating the same references
    const args = [...BASE_COMMAND_STRING.args];

    if (_withCoverage) {
        // The two coverage flags need to be pushed onto the args array before the project name
        // it seems. The dotnet command was not recognizing them at the end of the args array.
        args.push(COVERAGE_FLAGS);
    }

    if (StringUtils.hasValue(project)) {
        args.push(project);
    }

    if (CollectionUtils.isEmpty(_filter)) {
        return commandStringFactory.build(cmd, ...args);
    }

    // If we have filters to apply, further modification on the args array is necessary
    // Remove the project from the args array & place at end to ensure it is the last value
    // passed to dotnet test
    args = args
        .filter((arg) => arg !== project)
        .concat("--filter", _filter, project);
    return commandStringFactory.build(cmd, ...args);
};

/**
 * Builds the informational message for which project or solution is about to be tested.
 *
 * If no project is provided, it assumes we are running the entire solution.
 *
 * @param {CommandString} commandString
 * @param {string} [project=""]
 * @returns
 */
const _buildMessage = (commandString, project = "") => {
    const runningSolution = StringUtils.isEmpty(project);
    const hasFilter = CollectionUtils.hasValues(_filter);

    // Running entire solution with a filter
    if (runningSolution && hasFilter) {
        return `Running tests in the ${dotnetPath.solutionPath()} solution that match the xunit filter of '${_filter}' via (${commandString})`;
    }

    // Running entire solution w/o filter
    if (runningSolution) {
        return `Running all tests in the ${dotnetPath.solutionPath()} solution... via (${commandString})`;
    }

    // Running by project with a filter
    if (hasFilter) {
        return `Running tests in the ${project} project that match the xunit filter of '${_filter}' via (${commandString})`;
    }

    // Running by project w/o filter
    return `Running tests in the ${project} project... via (${commandString})`;
};

// #endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const dotnetTest = {
    ciMode(ciMode) {
        if (ciMode != null) {
            _ciMode = ciMode;
        }

        return this;
    },
    cmd() {
        return BASE_COMMAND_STRING;
    },
    description() {
        return `Runs dotnet test runner on the ${dotnetPath.solutionPath()} solution (via ${this.cmd()})`;
    },
    getOptions() {
        return DOTNET_TEST_OPTIONS;
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
     *      code: 1,
     *      name: "ExampleProject.Core.Tests",
     *      stderr: "...",
     *      stdout: "...",
     *  }
     */
    runProject(project) {
        // Build out the full command string as well as informational message based on configuration
        const commandString = _buildCommandString(project);
        const { cmd, args } = commandString;
        const message = _buildMessage(commandString, project);

        echo.message(message);

        // Determine the stdio mode based on whether or not this is being run in ci mode.
        // If in ci mode, we need to pipe output to capture stdout/stderr for the output summary.
        const stdioMode = _ciMode ? "pipe" : "inherit";
        const result = child_process.spawnSync(cmd, args, {
            stdio: stdioMode,
            shell: true,
        });

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
        if (CollectionUtils.isEmpty(testProjects)) {
            echo.error(
                "Could not find any csproj files matching the pattern *.Test*.csproj."
            );
            shell.exit(1);
        }

        echo.message(
            `Found ${
                testProjects.length
            } test projects in the ${dotnetPath.solutionDir()} solution...`
        );

        // Call runProject() for each project found that matches the pattern. This will return an object containing
        // the project name, exit status and stdout/stderr (if in ci mode)
        const results = testProjects.map((testProject) =>
            this.runProject(testProject)
        );

        // Check the results array for any non-zero exit codes and display helpful output for each
        const failedProjects = results.filter(
            (testResult) => testResult.code !== 0
        );
        if (CollectionUtils.isEmpty(failedProjects)) {
            dir.popd();
            echo.newLine();
            echo.message("Exited dotnet-test");
            return 0;
        }

        failedProjects.forEach((testResult) => {
            if (_ciMode) {
                echo.headerError(`Failed tests for ${testResult.name}`);
                echo.error(testResult.stderr);

                return;
            }

            echo.error(
                `Tests failed for ${testResult.name}. Scroll up or search the output for the project name for more detail.`
            );
        });

        echo.error(
            `${failedProjects.length} test projects exited with non-zero exit status. See above output for more detail.`
        );
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

        // Build out the full command string as well as informational message based on configuration
        const commandString = _buildCommandString();
        const { cmd, args } = commandString;
        const message = _buildMessage(commandString);

        echo.message(message);

        const result = child_process.spawnSync(cmd, args, {
            stdio: "inherit",
            shell: true,
        });
        if (result.status !== 0) {
            echo.error(`Exited with error: ${result.status}`);
            shell.exit(result.status);
        }

        dir.popd();
        echo.newLine();
        echo.message("Exited dotnet-test");
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
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = dotnetTest;

// #endregion Exports
