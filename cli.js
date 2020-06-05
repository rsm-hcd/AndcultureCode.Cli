#!/usr/bin/env node

// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const commands  = require("./_modules/commands");
const program   = require("commander");

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

        if (arg === undefined || arg === null || !arg.startsWith("//")) {
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

// Programatically loop over the 'commands' module, parsing the command + description out and
// registering them with commander
const commandObjects = Object.keys(commands).map((key) => commands[key]);

commandObjects.forEach((commandObject) => {
    program.command(commandObject.command, commandObject.description);
});

fixArgumentPosixPathConversion();

program.parse(process.argv);

// -----------------------------------------------------------------------------------------
// #region Validation
// -----------------------------------------------------------------------------------------

// Map out the individual 'command' strings for comparison with parsed args
// to see if invalid commands were passed in to the base program
const commandStrings = commandObjects.map((commandObj) => commandObj.command);

// Test to see if ALL args passed in are invalid. At least one of them should match a command here,
// with the assumption that any additional mismatching args are intentionally being passed to a sub-command.
let allParsedArgsInvalid = true;

program.args.forEach((arg) => {
    if (commandStrings.includes(arg)) {
        allParsedArgsInvalid = false;
    }
});

if (allParsedArgsInvalid) {
    program.help();
}

// #endregion Command validation

// #endregion Entrypoint
