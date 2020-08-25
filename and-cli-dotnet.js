#!/usr/bin/env node

require("./command-runner").run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Imports
    // -----------------------------------------------------------------------------------------

    const commands = require("./modules/commands");
    const dotnet = require("./modules/dotnet");
    const dotnetBuild = require("./modules/dotnet-build");
    const dotnetClean = require("./modules/dotnet-clean");
    const dotnetCli = require("./modules/dotnet-cli");
    const dotnetKill = require("./modules/dotnet-kill");
    const dotnetPublish = require("./modules/dotnet-publish");
    const dotnetRestore = require("./modules/dotnet-restore");
    const program = require("commander");

    // #endregion Imports

    // -----------------------------------------------------------------------------------------
    // #region Variables
    // -----------------------------------------------------------------------------------------

    const dotnetOptions = dotnet.getOptions();

    // #endregion Variables

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option(s)")
        .description(
            `${commands.dotnet.description} Certain options can be chained together for specific behavior ` +
                "(--clean and --restore can be used in conjunction with --build)."
        )
        .option(dotnetBuild.getOptions(), dotnetBuild.description())
        .option(dotnetClean.getOptions(), dotnetClean.description())
        .option(dotnetCli.getOptions(), dotnetCli.description())
        .option(dotnetKill.getOptions(), dotnetKill.description())
        .option(dotnetPublish.getOptions(), dotnetPublish.description())
        .option(dotnetRestore.getOptions(), dotnetRestore.description())
        .option(dotnetOptions.RUN, dotnet.description(dotnetOptions.RUN))
        .option(dotnetOptions.WATCH, dotnet.description(dotnetOptions.WATCH))
        .parse(process.argv);

    // Only run dotnet clean on its own if we aren't building, running, or watching in the same command
    // Otherwise, those commands will run the clean.
    if (!program.build && !program.run && !program.watch && program.clean) {
        dotnetClean.run();
    }

    // Only run dotnet restore on its own if we aren't building, running, or watching in the same command
    // Otherwise, those commands will run the restore.
    if (!program.build && !program.run && !program.watch && program.restore) {
        dotnetRestore.run();
    }

    if (program.build) {
        dotnetBuild.run(program.clean, program.restore);
    }

    if (program.cli) {
        dotnetCli.run(program.args.join(" "));
    }

    if (program.kill) {
        await dotnetKill.run();
    }

    if (program.publish) {
        dotnetPublish.run();
    }

    if (program.run) {
        dotnet
            .setClean(program.clean)
            .setRestore(program.restore)
            .setOption(dotnetOptions.RUN)
            .run();
    }

    if (program.watch) {
        dotnet
            .setClean(program.clean)
            .setRestore(program.restore)
            .setOption(dotnetOptions.WATCH)
            .run();
    }

    // If no options are passed in, just runs dotnet
    if (process.argv.slice(2).length === 0) {
        dotnet.run();
    }

    // #endregion Entrypoint
});
