#!/usr/bin/env node
require("./command-runner").run(async () => {
    /**************************************************************************************************
     * Imports
     **************************************************************************************************/

    const { spawnSync }  = require("child_process");
    const commands       = require("./_modules/commands");
    const dir            = require("./_modules/dir");
    const echo           = require("./_modules/echo");
    const frontendPath   = require("./_modules/frontend-path");
    const nodeClean      = require("./_modules/node-clean");
    const nodeRestore    = require("./_modules/node-restore");
    const program        = require("commander");
    const shell          = require("shelljs");
    const webpackPublish = require("./_modules/webpack-publish");

    /**************************************************************************************************
     * Commands
     **************************************************************************************************/

    // #region Webpack commands

    const webpack = {
        cmd() {
            return {
                args: ["run", "start"],
                cmd:  "npm",
                toString() {
                    return `${this.cmd} ${this.args.join(" ")}`
                },
            }
        },
        description() {
            return `Runs the webpack project (via ${this.cmd().toString()}}) found in ${frontendPath.projectDir()}`;
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

            echo.message(`Running frontend (via ${this.cmd().toString()})...`);
            const result = spawnSync(cmd, args, { stdio: "inherit", shell: true });

            if (result.status !== 0) {
                echo.error(`Exited with error: ${result.status}`);
                shell.exit(result.status);
            }

            dir.popd();
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
            `${commands.webpack.description} Certain options can be chained together for specific behavior` +
            "(--clean and --restore can be used in conjunction)."
        )
        .option("-c, --clean",   nodeClean.description())
        .option("-p, --publish", webpackPublish.description())
        .option("-R, --restore", nodeRestore.description())
        .parse(process.argv);

    // Publish
    if (program.publish) {
        const result = webpackPublish.run();
        shell.exit(result ? 0 : 1);
        return;
    }

    // If no options are passed in, run application
    webpack.run();

    // #endregion Entrypoint / Command router
});