#!/usr/bin/env node
require("./command-runner").run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Imports
    // -----------------------------------------------------------------------------------------

    const commands  = require("./_modules/commands");
    const migration = require("./_modules/migration");
    const program   = require("commander");

    // #endregion Imports

    // -----------------------------------------------------------------------------------------
    // #region Variables
    // -----------------------------------------------------------------------------------------

    const modes = migration.modes();

    // #endregion Variables

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option")
        .description(commands.migration.description)
        .option("-a, --add",     migration.description(modes.ADD))
        .option("-d, --delete",  migration.description(modes.DELETE))
        .option("-r, --run",     migration.description(modes.RUN))
        .parse(process.argv);

    if (program.add) {
        migration
            .mode(modes.ADD)
            .migrationName(program.args)
            .run();
    }

    if (program.delete) {
        migration
            .mode(modes.DELETE)
            .migrationName(program.args)
            .run();
    }

    if (program.run) {
        migration
            .mode(modes.RUN)
            .migrationName(program.args)
            .run();
    }

    if (process.argv.slice(2).length === 0) { program.help(); }

    // #endregion Entrypoint
});
