#!/usr/bin/env node

import { Commands } from "./modules/commands";
import { Dotnet } from "./modules/dotnet";
import { DotnetBuild } from "./modules/dotnet-build";
import { DotnetClean } from "./modules/dotnet-clean";
import { DotnetCli } from "./modules/dotnet-cli";
import { DotnetKill } from "./modules/dotnet-kill";
import { DotnetPublish } from "./modules/dotnet-publish";
import { DotnetRestore } from "./modules/dotnet-restore";
import program from "commander";
import { Js } from "./modules/js";
import { CommandRunner } from "./modules/command-runner";

CommandRunner.run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Variables
    // -----------------------------------------------------------------------------------------

    const dotnetOptions = Dotnet.getOptions();

    // #endregion Variables

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option(s)")
        .description(
            `${Commands.dotnet.description} Certain options can be chained together for specific behavior ` +
                "(--clean and --restore can be used in conjunction with --build)."
        )
        .option(DotnetBuild.getOptions().toString(), DotnetBuild.description())
        .option(DotnetClean.getOptions().toString(), DotnetClean.description())
        .option(DotnetCli.getOptions().toString(), DotnetCli.description())
        .option(DotnetKill.getOptions().toString(), DotnetKill.description())
        .option(
            DotnetPublish.getOptions().toString(),
            DotnetPublish.description()
        )
        .option(
            DotnetRestore.getOptions().toString(),
            DotnetRestore.description()
        )
        .option(
            dotnetOptions.RUN.toString(),
            Dotnet.description(dotnetOptions.RUN)
        )
        .option(
            dotnetOptions.WATCH.toString(),
            Dotnet.description(dotnetOptions.WATCH)
        )
        .parse(process.argv);

    // Only run dotnet clean on its own if we aren't building, running, or watching in the same command
    // Otherwise, those commands will run the clean.
    if (!program.build && !program.run && !program.watch && program.clean) {
        DotnetClean.run();
    }

    // Only run dotnet restore on its own if we aren't building, running, or watching in the same command
    // Otherwise, those commands will run the restore.
    if (!program.build && !program.run && !program.watch && program.restore) {
        DotnetRestore.run();
    }

    if (program.build) {
        DotnetBuild.run(program.clean, program.restore);
    }

    if (program.cli) {
        DotnetCli.run(program.args);
    }

    if (program.kill) {
        await DotnetKill.run();
    }

    if (program.publish) {
        DotnetPublish.run();
    }

    if (program.run) {
        Dotnet.setClean(program.clean)
            .setRestore(program.restore)
            .setOption(dotnetOptions.RUN)
            .run();
    }

    if (program.watch) {
        Dotnet.setClean(program.clean)
            .setRestore(program.restore)
            .setOption(dotnetOptions.WATCH)
            .run();
    }

    // If no options are passed in, just runs dotnet
    if (Js.hasNoArguments()) {
        Dotnet.run();
    }

    // #endregion Entrypoint
});
