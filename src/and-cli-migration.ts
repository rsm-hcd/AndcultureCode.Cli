#!/usr/bin/env node

import { CommandRunner } from "./modules/command-runner";
import { Commands } from "./modules/commands";
import { Migration } from "./modules/migration";
import program from "commander";
import { MigrationMode } from "./enums/migration-mode";
import { Js } from "./modules/js";

CommandRunner.run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Constants
    // -----------------------------------------------------------------------------------------

    const { ADD, DELETE, RUN } = Migration.getOptions();

    // #endregion Constants

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option")
        .description(Commands.migration.description)
        .option(ADD.toString(), Migration.description(MigrationMode.ADD))
        .option(DELETE.toString(), Migration.description(MigrationMode.DELETE))
        .option(RUN.toString(), Migration.description(MigrationMode.RUN))
        .parse(process.argv);

    if (program.add) {
        Migration.mode(MigrationMode.ADD)
            .migrationName(program.args)
            .run();
    }

    if (program.delete) {
        Migration.mode(MigrationMode.DELETE)
            .migrationName(program.args)
            .run();
    }

    if (program.run) {
        Migration.mode(MigrationMode.RUN)
            .migrationName(program.args)
            .run();
    }

    if (Js.hasNoArguments()) {
        program.help();
    }

    // #endregion Entrypoint
});
