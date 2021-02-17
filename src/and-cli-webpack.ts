#!/usr/bin/env node

import { CommandStringBuilder } from "./utilities/command-string-builder";
import child_process from "child_process";
import { CommandDefinitions } from "./modules/command-definitions";
import { Dir } from "./modules/dir";
import { Echo } from "./modules/echo";
import { FrontendPath } from "./modules/frontend-path";
import { NodeClean } from "./modules/node-clean";
import { NodeRestore } from "./modules/node-restore";
import program from "commander";
import shell from "shelljs";
import { WebpackPublish } from "./modules/webpack-publish";
import { OptionStringBuilder } from "./utilities/option-string-builder";
import { CommandRunner } from "./modules/command-runner";

CommandRunner.run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Constants
    // -----------------------------------------------------------------------------------------

    const WEBPACK_OPTIONS: Record<string, OptionStringBuilder> = {
        CLEAN: NodeClean.getOptions(),
        PUBLISH: WebpackPublish.getOptions(),
        RESTORE: NodeRestore.getOptions(),
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
        run() {
            Dir.pushd(FrontendPath.projectDir());

            if (program.clean) {
                NodeClean.run();
            }

            if (program.restore) {
                NodeRestore.run();
            }

            // Since the spawnSync function takes the base command and all arguments separately, we cannot
            // leverage the base dotnet command string here. We'll build out the arg list in an array.
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
            `${CommandDefinitions.webpack.description} Certain options can be chained together for specific behavior` +
                "(--clean and --restore can be used in conjunction)."
        )
        .option(NodeClean.getOptions().toString(), NodeClean.description())
        .option(
            WebpackPublish.getOptions().toString(),
            WebpackPublish.description()
        )
        .option(NodeRestore.getOptions().toString(), NodeRestore.description())
        .parse(process.argv);

    // Publish
    if (program.publish) {
        const result = WebpackPublish.run();
        shell.exit(result ? 0 : 1);
        return;
    }

    // If no options are passed in, run application
    webpack.run();

    // #endregion Entrypoint
});
