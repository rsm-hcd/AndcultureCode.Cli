#!/usr/bin/env node

import { OptionStringBuilder } from "./utilities/option-string-builder";
import { CommandStringBuilder } from "./utilities/command-string-builder";
import { CommandRunner } from "./modules/command-runner";
import child_process from "child_process";
import { Dir } from "./modules/dir";
import { Echo } from "./modules/echo";
import { FrontendPath } from "./modules/frontend-path";
import { NodeClean } from "./modules/node-clean";
import { NodeRestore } from "./modules/node-restore";
import program from "commander";
import shell from "shelljs";

CommandRunner.run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Constants
    // -----------------------------------------------------------------------------------------

    const CI_OPTION_STRING = new OptionStringBuilder("ci");

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
                return new CommandStringBuilder(
                    "npx",
                    "cross-env",
                    "CI=true",
                    "npm",
                    "run",
                    "test"
                );
            }

            return new CommandStringBuilder("npm", "run", "test");
        },
        description() {
            return `Runs the webpack project tests in ${FrontendPath.projectDir()} (via ${this.cmd()})`;
        },
        getOptions() {
            return WEBPACK_TEST_OPTIONS;
        },
        run() {
            Dir.pushd(FrontendPath.projectDir());

            if (program.clean) {
                NodeClean.run();
            }

            if (program.restore) {
                NodeRestore.run();
            }

            Echo.message(
                `Running frontend tests (via ${this.cmd(program.ci)})...`
            );

            // Continuous Integration mode (ci)
            if (program.ci) {
                const result = shell.exec(this.cmd(true).toString());

                if (result.code !== 0) {
                    Echo.headerError("One or many tests failed");
                    shell.exit(result.code);
                }
                return;
            }

            // Interactive mode (non-ci)
            const { cmd, args } = this.cmd();

            const result = child_process.spawnSync(cmd, args, {
                stdio: "inherit",
                shell: true,
            });

            if (result.status != null && result.status !== 0) {
                Echo.error(`Exited with error: ${result.status}`);
                shell.exit(result.status);
            }

            Dir.popd();
            Echo.newLine();
            Echo.message("Exited webpack-test");
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
            WEBPACK_TEST_OPTIONS.CI.toString(),
            "Run the command for continuous integration instead of as a daemon"
        )
        .option(NodeClean.getOptions().toString(), NodeClean.description())
        .option(NodeRestore.getOptions().toString(), NodeRestore.description())
        .parse(process.argv);

    webpackTest.run();

    // #endregion Entrypoint
});
