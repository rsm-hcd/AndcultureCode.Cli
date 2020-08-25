#!/usr/bin/env node
require("./command-runner").run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Imports
    // -----------------------------------------------------------------------------------------

    const { spawnSync } = require("child_process");
    const commandStringFactory = require("./utilities/command-string-factory");
    const dir = require("./modules/dir");
    const echo = require("./modules/echo");
    const frontendPath = require("./modules/frontend-path");
    const nodeClean = require("./modules/node-clean");
    const nodeRestore = require("./modules/node-restore");
    const optionStringFactory = require("./utilities/option-string-factory");
    const program = require("commander");
    const shell = require("shelljs");

    // #endregion Imports

    // -----------------------------------------------------------------------------------------
    // #region Constants
    // -----------------------------------------------------------------------------------------

    const CI_OPTION_STRING = optionStringFactory.build("ci");

    const WEBPACK_TEST_OPTIONS = {
        CI: CI_OPTION_STRING,
    };

    // #endregion Constants

    // -----------------------------------------------------------------------------------------
    // #region Functions
    // -----------------------------------------------------------------------------------------

    /**
     * Developer note: This should be abstracted into a module and tested
     * @see https://github.com/AndcultureCode/AndcultureCode.Cli/issues/96
     */
    const webpackTest = {
        cmd(isCI = false) {
            if (isCI) {
                return commandStringFactory.build(
                    "npx",
                    "cross-env",
                    "CI=true",
                    "npm",
                    "run",
                    "test"
                );
            }

            return commandStringFactory.build("npm", "run", "test");
        },
        description() {
            return `Runs the webpack project tests in ${frontendPath.projectDir()} (via ${this.cmd()})`;
        },
        getOptions() {
            return WEBPACK_TEST_OPTIONS;
        },
        run() {
            dir.pushd(frontendPath.projectDir());

            if (program.clean) {
                nodeClean.run();
            }

            if (program.restore) {
                nodeRestore.run();
            }

            echo.message(`Running frontend tests (via ${this.cmd()})...`);

            // Continuous Integration mode (ci)
            if (program.ci) {
                const result = shell.exec(this.cmd(true), { silent: false });

                if (result.code !== 0) {
                    echo.headerError("One or many tests failed");
                    shell.exit(result.code);
                }
                return;
            }

            // Interactive mode (non-ci)
            const { cmd, args } = this.cmd();

            const result = spawnSync(cmd, args, {
                stdio: "inherit",
                shell: true,
            });

            if (result.status !== 0) {
                echo.error(`Exited with error: ${result.status}`);
                shell.exit(result.status);
            }

            dir.popd();
            echo.newLine();
            echo.message("Exited webpack-test");
        },
    };

    // #endregion Functions

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option(s)")
        .description(
            webpackTest.description() +
                "\r\nCertain options can be chained together for specific behavior" +
                " (--clean and --restore can be used in conjunction)."
        )
        .option(
            WEBPACK_TEST_OPTIONS.CI,
            "Run the command for continuous integration instead of as a daemon"
        )
        .option(nodeClean.getOptions(), nodeClean.description())
        .option(nodeRestore.getOptions(), nodeRestore.description())
        .parse(process.argv);

    webpackTest.run();

    // #endregion Entrypoint
});
