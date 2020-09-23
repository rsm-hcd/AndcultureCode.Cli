#!/usr/bin/env node

// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const commandRegistry = require("./modules/command-registry");
const packageConfig = require("./modules/package-config");
const program = require("commander");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

/*
 * Returns whether or not the application is currently being run as an imported module (ie, another
 * package/program is importing the CLI to extend its behavior)
 *
 * @see https://codewithhugo.com/node-module-entry-required/
 * @see https://nodejs.org/api/modules.html#modules_accessing_the_main_module
 */
const isImportedModule = require.main !== module;

/**
 * Returns whether or not the application is currently being run directly and not as a required package.
 */
const isNotImportedModule = !isImportedModule;

// #endregion Variables

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

program.description(packageConfig.getBaseDescription());
program.version(packageConfig.getBaseVersion());

// Set the flag in the command registry to denote whether the application is currently being run
// directly or in a package
commandRegistry.initialize(isImportedModule);

// By default, we will only register base commands when being run directly. The consumer
// application can choose to register the base commands (or not)
if (isNotImportedModule) {
    commandRegistry.registerBaseCommands().registerAliasesFromConfig();
}

fixArgumentPosixPathConversion();

// Only parse arguments if we're running the application directly. Otherwise, let the consumer CLI application
// choose when to parse arguments. This allows them the freedom of reconfiguring commands, overriding
// the description, etc.
if (isNotImportedModule) {
    commandRegistry.parseWithAliases();
}

// #endregion Entrypoint

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

/**
 * `and-cli` module
 *
 * The current configuration of the program is exported for a consumer to use. If desired, a consumer
 * can build their own custom commands along with the ones that we provide out of the box, or pick
 * and choose specific commands/modules. See the linked repository for an example project.
 *
 * @see https://github.com/AndcultureCode/AndcultureCode.Cli.PluginExample
 */
module.exports = program;

// #endregion Exports
