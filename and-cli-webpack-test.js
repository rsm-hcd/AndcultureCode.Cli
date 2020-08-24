#!/usr/bin/env node
require("./command-runner").run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Imports
    // -----------------------------------------------------------------------------------------

    const { spawnSync } = require("child_process");
    const dir = require("./_modules/dir");
    const echo = require("./_modules/echo");
    const frontendPath = require("./_modules/frontend-path");
    const nodeClean = require("./_modules/node-clean");
    const nodeRestore = require("./_modules/node-restore");
    const program = require("commander");
    const shell = require("shelljs");

    // #endregion Imports

    // -----------------------------------------------------------------------------------------
    // #region Functions
    // -----------------------------------------------------------------------------------------

    const webpackTest = {
        cmd() {
            return {
                args: ["run", "test"],
                cmd: "npm",
                toString() {
                    return `${this.cmd} ${this.args.join(" ")}`;
                },
            };
        },
        description() {
            return `Runs the webpack project tests in ${frontendPath.projectDir()} (via ${this.cmd().toString()})`;
        },
        run() {
            dir.pushd(frontendPath.projectDir());

            if (program.clean) {
                nodeClean.run();
            }

            if (program.restore) {
                nodeRestore.run();
            }

            echo.message(
                `Running frontend tests (via ${this.cmd().toString()})...`
            );

            // Continuous Integration mode (ci)
            if (program.ci) {
                const result = shell.exec(
                    `npx cross-env CI=true ${this.cmd().toString()}`,
                    { silent: false }
                );

                if (result.code !== 0) {
                    echo.headerError("One or many tests failed");
                    shell.exit(result.code);
                }
                return;
            }

            // Interactive mode (non-ci)

            // Since the spawnSync function takes the base command and all arguments separately, we cannot
            // leverage the base dotnet command string here. We'll build out the arg list in an array.
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
            "--ci",
            "Run the command for continuous integration instead of as a daemon"
        )
        .option("-c, --clean", nodeClean.description())
        .option("-R, --restore", nodeRestore.description())
        .parse(process.argv);

    webpackTest.run();

    // #endregion Entrypoint
});
