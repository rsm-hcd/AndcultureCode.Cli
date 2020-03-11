#!/usr/bin/env node

require("./command-runner").run(async () => {
    /**************************************************************************************************
     * Imports
     **************************************************************************************************/

    const { spawn }    = require("child_process");
    const dir          = require("./_modules/dir");
    const echo         = require("./_modules/echo");
    const frontendPath = require("./_modules/frontend-path");
    const nodeClean    = require("./_modules/node-clean");
    const nodeRestore  = require("./_modules/node-restore");
    const program      = require("commander");
    const shell        = require("shelljs");

    /**************************************************************************************************
     * Commands
     **************************************************************************************************/

    // #region Webpack commands

    const webpackTest = {
        cmds: {
            webpackTest: "npm run test",
        },
        description() {
            return `Runs the webpack project tests in ${frontendPath.projectDir()} (via ${this.cmds.webpackTest})`;
        },
        run() {
            dir.pushd(frontendPath.projectDir());

            if (program.clean) {
                nodeClean.run();
            }

            if (program.restore) {
                nodeRestore.run();
            }

            echo.message(`Running frontend tests (via ${this.cmds.webpackTest})...`);

            // Continuous Integration mode (ci)
            if (program.ci) {
                const result = shell.exec(`npx cross-env CI=true ${this.cmds.webpackTest}`, { silent: false });

                if (result.code !== 0) {
                    echo.headerError("One or many tests failed");
                    shell.exit(result.code);
                }
                return;
            }

            // Interactive mode (non-ci)
            const child = spawn(this.cmds.webpackTest, { stdio: "inherit", shell: true });
            child.on("exit", (code, signal) => {
                if (code !== 0) {
                    echo.error(`Exited with error ${signal}`);
                    shell.exit(code);
                }

                dir.popd();
                echo.newLine();
                echo.message("Exited webpack-test");
            });
        },
    };

    // #endregion Webpack commands


    /**************************************************************************************************
     * Entrypoint / Command router
     **************************************************************************************************/

    // #region Entrypoint / Command router

    program
        .usage("option(s)")
        .description(
            webpackTest.description() +
            "\r\nCertain options can be chained together for specific behavior" +
            " (--clean and --restore can be used in conjunction)."
        )
        .option("--ci",          "Run the command for continuous integration instead of as a daemon")
        .option("-c, --clean",   nodeClean.description())
        .option("-R, --restore", nodeRestore.description())
        .parse(process.argv);

    webpackTest.run();

    // #endregion Entrypoint / Command router
});