#!/usr/bin/env node
require("./command-runner").run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Imports
    // -----------------------------------------------------------------------------------------

    const child_process = require("child_process");
    const commands = require("./modules/commands");
    const commandStringFactory = require("./utilities/command-string-factory");
    const dir = require("./modules/dir");
    const echo = require("./modules/echo");
    const frontendPath = require("./modules/frontend-path");
    const nodeClean = require("./modules/node-clean");
    const nodeRestore = require("./modules/node-restore");
    const program = require("commander");
    const shell = require("shelljs");
    const webpackPublish = require("./modules/webpack-publish");

    // #endregion Imports

    // -----------------------------------------------------------------------------------------
    // #region Constants
    // -----------------------------------------------------------------------------------------

    const WEBPACK_OPTIONS = {
        CLEAN: nodeClean.getOptions(),
        PUBLISH: webpackPublish.getOptions(),
        RESTORE: nodeRestore.getOptions(),
    };

    // #endregion Constants

    // -----------------------------------------------------------------------------------------
    // #region Functions
    // -----------------------------------------------------------------------------------------

    /**
     * Developer note: This should be abstracted into a module and tested
     * @see https://github.com/AndcultureCode/AndcultureCode.Cli/issues/97
     */
    const webpack = {
        cmd() {
            return commandStringFactory.build("npm", "run", "start");
        },
        description() {
            return `Runs the webpack project (via ${this.cmd()}}) found in ${frontendPath.projectDir()}`;
        },
        getOptions() {
            return WEBPACK_OPTIONS;
        },
        run() {
            dir.pushd(frontendPath.projectDir());

            if (program.clean) {
                nodeClean.run();
            }

            if (program.restore) {
                nodeRestore.run();
            }

            // Since the spawnSync function takes the base command and all arguments separately, we cannot
            // leverage the base dotnet command string here. We'll build out the arg list in an array.
            const { cmd, args } = this.cmd();

            echo.message(`Running frontend (via ${this.cmd()})...`);
            const result = child_process.spawnSync(cmd, args, {
                stdio: "inherit",
                shell: true,
            });

            if (result.status !== 0) {
                echo.error(`Exited with error: ${result.status}`);
                shell.exit(result.status);
            }

            dir.popd();
        },
    };

    // #endregion Functions

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option(s)")
        .description(
            `${commands.webpack.description} Certain options can be chained together for specific behavior` +
                "(--clean and --restore can be used in conjunction)."
        )
        .option(WEBPACK_OPTIONS.CLEAN, nodeClean.description())
        .option(WEBPACK_OPTIONS.PUBLISH, webpackPublish.description())
        .option(WEBPACK_OPTIONS.RESTORE, nodeRestore.description())
        .parse(process.argv);

    // Publish
    if (program.publish) {
        const result = webpackPublish.run();
        shell.exit(result ? 0 : 1);
        return;
    }

    // If no options are passed in, run application
    webpack.run();

    // #endregion Entrypoint
});
