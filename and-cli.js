#!/usr/bin/env node

// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const commands = require("./modules/commands");
const program = require("commander");
const version = require("./package.json").version;

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

/**
 * Argument POSIX path conversion fix
 * - To pass arguments that start with a '/', you must escape it with '//'
 */
const fixArgumentPosixPathConversion = () => {
    for (var i = 0; i <= process.argv.length; i++) {
        let arg = process.argv[i];

        if (arg == null || !arg.startsWith("//")) {
            continue;
        }

        process.argv[i] = arg.substring(1);
    }
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Entrypoint
// -----------------------------------------------------------------------------------------

program.description("andculture cli");
program.version(version);

// Programmatically loop over the 'commands' module, parsing the command + description out and
// registering them with commander
const commandObjects = Object.keys(commands).map((key) => commands[key]);

commandObjects.forEach((commandObject) => {
    program.command(commandObject.command, commandObject.description);
});

fixArgumentPosixPathConversion();

program.parse(process.argv);

// #endregion Entrypoint
