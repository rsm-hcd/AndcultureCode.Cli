#!/usr/bin/env node

import child_process from "child_process";
import program from "commander";
import shell from "shelljs";
import { CommandRunner } from "./modules/command-runner";
import { Commands } from "./modules/commands";
import { Dir } from "./modules/dir";
import { Echo } from "./modules/echo";
import { FrontendPath } from "./modules/frontend-path";
import { NodeCI } from "./modules/node-ci";
import { NodeClean } from "./modules/node-clean";
import { NodeRestore } from "./modules/node-restore";
import { WebpackPublish } from "./modules/webpack-publish";
import { CommandStringBuilder } from "./utilities/command-string-builder";
import { OptionStringBuilder } from "./utilities/option-string-builder";

CommandRunner.run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Constants
    // -----------------------------------------------------------------------------------------

    const WEBPACK_OPTIONS: Record<string, OptionStringBuilder> = {
        CLEAN: NodeClean.getOptions(),
        PUBLISH: WebpackPublish.getOptions(),
        RESTORE: NodeRestore.getOptions(),
        CI: NodeCI.getOptions(),
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
        cmd(): CommandStringBuilder {
            return new CommandStringBuilder("npm", "run", "start");
        },
        description(): string {
            return `Runs the webpack project (via ${this.cmd()}}) found in ${FrontendPath.projectDir()}`;
        },
        getOptions(): Record<string, OptionStringBuilder> {
            return WEBPACK_OPTIONS;
        },
        restore(): void {
            if (program.ci) {
                NodeCI.run();
                return;
            }
            if (program.clean) {
                NodeClean.run();
            }
            if (program.restore) {
                NodeRestore.run();
            }
        },
        run() {
            Dir.pushd(FrontendPath.projectDir());

            if (program.clean) {
                NodeClean.run();
            }
            if (program.restore) {
                NodeRestore.run();
            }

            const { cmd, args } = this.cmd();

            Echo.message(`Running frontend (via ${this.cmd()})...`);
            const { status } = child_process.spawnSync(cmd, args, {
                stdio: "inherit",
                shell: true,
            });

            if (status != null && status !== 0) {
                Echo.error(`Exited with error: ${status}`);
                shell.exit(status);
            }

            Dir.popd();
        },
    };

    // #endregion Functions

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option(s)")
        .description(
            `${Commands.webpack.description} Certain options can be chained together for specific behavior` +
                "(--clean and --restore can be used in conjunction)."
        )
        .option(NodeClean.getOptions().toString(), NodeClean.description())
        .option(
            WebpackPublish.getOptions().toString(),
            WebpackPublish.description()
        )
        .option(NodeRestore.getOptions().toString(), NodeRestore.description())
        .option("--skip-restore", "Skip npm restore", false)
        .option("--skip-clean", "Skip npm clean", false)
        .option("--ci", "Restore packages with npm ci", false)
        .parse(process.argv);

    // Publish
    if (program.publish) {
        const result = WebpackPublish.run({
            skipClean: program.skipClean,
            skipRestore: program.skipRestore,
            ci: program.ci,
        });
        shell.exit(result ? 0 : 1);
        return;
    }

    // If no options are passed in, run application
    webpack.run();

    // #endregion Entrypoint
});
