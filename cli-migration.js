#!/usr/bin/env node

const commands  = require("./_modules/commands");
const program   = require("commander");
const migration = require("./_modules/migration");
const modes     = migration.modes();

// #endregion Migration commands

// #region Entrypoint / Command router

program
    .usage("option")
    .description(commands.migration.description)
    .option("-a, --add",                  migration.descriptionCreate())
    .option("-d, --delete",               migration.descriptionDelete())
    .option("-r, --run",                  migration.descriptionRun())
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

if (process.argv.slice(2).length === 0) { program.help();                     }

// #endregion Entrypoint / Command router
