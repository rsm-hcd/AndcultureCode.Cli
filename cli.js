#!/usr/bin/env node

/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const commands  = require("./_modules/commands");
const program   = require("commander");


/**************************************************************************************************
 * Entrypoint / Command router
 **************************************************************************************************/

// #region Entrypoint / Command router

program.description("andculture cli");

// Programatically loop over the 'commands' module, parsing the command + description out and
// registering them with commander
const commandObjects = Object.keys(commands).map((key) => commands[key]);

commandObjects.forEach((commandObject) => {
    program.command(commandObject.command, commandObject.description);
});

program.parse(process.argv)

// #endregion Entrypoint / Command router


/**************************************************************************************************
 * Command validation
 **************************************************************************************************/

// #region Command validation

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