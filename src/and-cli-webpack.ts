#!/usr/bin/env node

import { CommandDefinitions } from "./modules/command-definitions";
import { NodeClean } from "./modules/node-clean";
import { NodeRestore } from "./modules/node-restore";
import { WebpackPublish } from "./modules/webpack-publish";
import { CommandRunner } from "./modules/command-runner";
import { Webpack } from "./modules/webpack";
import { Options } from "./constants/options";
import { NodeCI } from "./modules/node-ci";
import shell from "shelljs";
import program from "commander";

CommandRunner.run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option(s)")
        .description(
            `${CommandDefinitions.webpack.description} Certain options can be chained together for specific behavior` +
                `(${Options.Clean} and ${Options.Restore} can be used in conjunction).`
        )
        .option(Options.Clean.toString(), NodeClean.description())
        .option(Options.Publish.toString(), WebpackPublish.description())
        .option(Options.Restore.toString(), NodeRestore.description())
        .option(NodeCI.getOptions().toString(), NodeCI.description())
        .option("--skip-clean", "Skip npm clean", false)
        .option("--skip-restore", "Skip npm restore", false)
        .parse(process.argv);

    const {
        ci,
        clean,
        publish,
        restore,
        skipClean,
        skipRestore,
    } = program.opts();

    // Publish
    if (publish === true) {
        WebpackPublish.run({
            ci,
            skipClean,
            skipRestore,
        });
        return;
    }

    Webpack.run(clean, restore);

    // #endregion Entrypoint
});
