#!/usr/bin/env node

import { CommandDefinitions } from "./modules/command-definitions";
import { NugetUpgrade } from "./modules/nuget-upgrade";
import program from "commander";
import { CommandRunner } from "./modules/command-runner";
import { Js } from "./modules/js";
import { NugetPublish } from "./modules/nuget-publish";

CommandRunner.run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option(s)")
        .description(CommandDefinitions.nuget.description)
        .option(
            NugetPublish.getOptions().toString(),
            NugetPublish.description()
        )
        .option(
            NugetUpgrade.getOptions().toString(),
            NugetUpgrade.description()
        )
        .parse(process.argv);

    const { publish, upgrade } = program.opts();

    if (publish != null) {
        await NugetPublish.run(publish);
        return;
    }

    if (upgrade != null) {
        await NugetUpgrade.run();
        return;
    }

    // If no options are passed in, output help
    if (Js.hasNoArguments()) {
        program.help();
    }

    // #endregion Entrypoint
});
