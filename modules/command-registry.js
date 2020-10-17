// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const { CLI_NAME, NODE_MODULES } = require("./constants");
const {
    StringUtils,
    CollectionUtils,
} = require("andculturecode-javascript-core");
const { purple } = require("./formatters");
const commands = require("./commands");
const echo = require("./echo");
const packageConfig = require("./package-config");
const program = require("commander");
const shell = require("shelljs");
const upath = require("upath");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

/**
 * Informational prefix to display before aliased commands in the help menu
 */
const ALIAS_PREFIX = purple("(alias)");

/**
 * Flattened array of CommandDefinitions from the base project. (see 'commands' module)
 *
 * @type {CommandDefinition[]}
 */
const BASE_COMMAND_DEFINITIONS = Object.keys(commands).map(
    (key) => commands[key]
);

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

/**
 * Boolean flag to determine whether the application is being run directly or as a required package.
 *
 * @type {boolean}
 */
let _isImportedModule;

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

/**
 * Returns true if the command definition matches the given name (case insensitive)
 *
 * @param {program.Command} command Command object for comparison
 * @param {string} name Name of the command for comparison
 */
const _commandEqualsByName = (command, name) =>
    command.name().toLowerCase() === name.toLowerCase();

/**
 * Returns a registered command by name. If the command is not registered, returns `undefined`
 *
 * @param {string} commandName
 */
const _getCommand = (commandName) => {
    if (StringUtils.isEmpty(commandName)) {
        return undefined;
    }

    return program.commands.find((registeredCommand) =>
        _commandEqualsByName(registeredCommand, commandName)
    );
};

/**
 * Returns the registered aliases as command definitions, with the prefix text stripped out
 */
const _getAliasCommandDefinitions = () => {
    const aliasCommands = program.commands.filter((command) =>
        command.description().startsWith(ALIAS_PREFIX)
    );

    return aliasCommands.map((aliasCommand) => {
        return {
            command: aliasCommand.name(),
            description: aliasCommand
                .description()
                // strip out the '(alias)' text for it to be parsed correctly
                .replace(ALIAS_PREFIX, "")
                .trim(),
        };
    });
};

/**
 * Returns a path to the executable file for a given command, based on whether the application is
 * being imported or run directly.
 * @param {string} commandName The name of the command to build a file path for.
 */
const _getExecutablePath = (commandName) => {
    const filename = `${CLI_NAME}-${commandName}.js`;
    if (_isImportedModule != null && _isImportedModule) {
        // Returns './node_modules/and-cli/and-cli-dotnet.js, for example
        return upath.join(".", NODE_MODULES, CLI_NAME, filename);
    }

    // Otherwise, default to files in the current project directory
    return upath.join(".", filename);
};

/**
 * Pre-processes the argv string array and return the corresponding command if any defined aliases
 * match the given input
 */
const _preprocessArgsForAliases = () => {
    const aliases = _getAliasCommandDefinitions();
    if (CollectionUtils.isEmpty(aliases)) {
        return undefined;
    }

    // We expect the node binary & entrypoint filename to be the first two process.argv entries,
    // and anything after that to be a command or option. If we have more or less arguments,
    // we shouldn't attempt to match against any aliases. Aliases can only be
    // one word (no spaces), so let's not try to eagerly compare every single argument to the alias list
    if (CollectionUtils.length(process.argv) !== 3) {
        return undefined;
    }

    // Cloning with spread operator to avoid mutating original process.argv reference
    const lastArg = [...process.argv].pop();

    // Return the alias command that matches the given input, or undefined
    return aliases.find((alias) => alias.command === lastArg);
};

/**
 * Registers a command, taking into consideration whether the command is a base command or a local command.
 *
 * This function assumes the command is valid & ready to be registered (see `_validateAndGetBaseCommand`
 * and `_validateCommandRegistration` for validation logic)
 *
 * @param {CommandDefinition} commandDefinition
 * @param {boolean} isBaseCommand Flag to determine whether we're registering a base command or a local command
 */
const _registerCommand = (commandDefinition, isBaseCommand = false) => {
    const { command, description } = commandDefinition;

    if (!isBaseCommand) {
        program.command(command, description);
        _sortCommandsByName();
        return;
    }

    // See `commander.ExecutableCommandOptions`
    program.command(command, description, {
        executableFile: _getExecutablePath(command),
    });

    _sortCommandsByName();
};

/**
 * Sorts the command list alphabetically by name
 */
const _sortCommandsByName = () => {
    program.commands = program.commands.sort((commandA, commandB) =>
        commandA.name().localeCompare(commandB.name())
    );
};

/**
 * Validates that the given command name has a value, and exists in the base command definition array,
 * returning the found definition (or exiting if provided invalid input)
 *
 * @param {string} commandName
 * @returns {CommandDefinition} The CommandDefinition for the requested command
 */
const _validateAndGetBaseCommand = (commandName) => {
    const commandNames = BASE_COMMAND_DEFINITIONS.map(
        (commandDefinition) => commandDefinition.command
    ).join(", ");

    if (StringUtils.isEmpty(commandName)) {
        echo.error(
            `Command name is required. Available commands are: ${commandNames}`
        );
        shell.exit(1);
        // Returning here for the purpose of testing, shell.exit will kill the process in a normal run
        return;
    }

    const baseCommand = BASE_COMMAND_DEFINITIONS.find(
        (commandDefinition) =>
            commandDefinition.command.toLowerCase() ===
            commandName.toLowerCase()
    );

    if (baseCommand == null) {
        echo.error(
            `The specified command '${commandName}' was not found. Available commands are: ${commandNames}`
        );
        shell.exit(1);
        // Returning here for the purpose of testing, shell.exit will kill the process in a normal run
        return;
    }

    return baseCommand;
};

/**
 * Validates a command registration based on whether a command of the same name is already registered,
 * and if the consumer has opted in to overriding it.
 *
 * @param {CommandDefinition} commandDefinition
 * @param {boolean} overrideIfRegistered
 * @returns {boolean} True if the command is not already registered, or is registered & can be overridden.
 */
const _validateCommandRegistration = (
    commandDefinition,
    overrideIfRegistered = false
) => {
    const { command } = commandDefinition;

    // First, check to see if command is already registered.
    const commandIsRegistered = _getCommand(command) != null;

    if (!commandIsRegistered || overrideIfRegistered) {
        return true;
    }

    echo.warn(
        `Command '${command}' has already been registered and 'overrideIfRegistered' is set to false. Skipping this command registration.`
    );
    return false;
};

/**
 * Ensures the initialize function is called with valid data & only called one
 *
 * @param {boolean} isImportedModule
 */
const _validateInitializationOrExit = (isImportedModule) => {
    if (isImportedModule == null) {
        echo.error(
            "commandRegistry.initialize() should not be called with a null or undefined value."
        );
        shell.exit(1);
    }

    if (_isImportedModule != null) {
        echo.error(
            "commandRegistry.initialize() should only be called once during runtime."
        );
        shell.exit(1);
    }
};

// #endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Public Functions
// -----------------------------------------------------------------------------------------

const commandRegistry = {
    /**
     * Clears out all command registered with the program.
     *
     * @returns `this` for chaining
     */
    clear() {
        program.commands = [];
        return this;
    },

    /**
     * Utility for retrieving an array of the command definitions (command name, description) defined
     * in the base project.
     *
     * @returns {CommandDefinition[]}
     */
    getBaseCommandDefinitions() {
        return BASE_COMMAND_DEFINITIONS;
    },

    /**
     * Returns a registered command by name. If the command is not registered, returns `undefined`
     *
     * @param {string} name
     * @returns {program.Command}
     */
    getCommand(name) {
        return _getCommand(name);
    },

    /**
     * Sets a flag to determine how base commands are registered (whether they are located in the
     * node_modules folder, or the current project directory)
     *
     * Should only be called once.
     *
     * @param {boolean} isImportedModule
     * @returns `this` for chaining
     */
    initialize(isImportedModule) {
        _validateInitializationOrExit(isImportedModule);

        _isImportedModule = isImportedModule;

        return this;
    },

    /**
     * Wrapper around commander's `parse` method to hold additional logic around processing aliases
     * If you don't want to support aliases, using the regular `program.parse(process.argv)` is fine.
     *
     * If no aliases are defined, or no args match defined aliases, it defaults to parsing process.argv
     */
    parseWithAliases() {
        // Check for any user-defined aliases against the passed args before the regular program flow
        const aliasCommand = _preprocessArgsForAliases();

        // Regular program flow, nothing special to do here.
        if (aliasCommand == null) {
            program.parse(process.argv);
            return;
        }

        // Found a matching command alias, let the user know what we're doing and split the description
        // to retrieve our args array.
        const { command, description } = aliasCommand;
        echo.message(
            `Matched alias '${purple(command)}', executing '${purple(
                description
            )}'`
        );

        const transformedArgs = description.split(" ");
        program.parse(transformedArgs, { from: "user" });
    },

    /**
     * Registers an alias for another command or command & options. Expects the `CommandDefinition`
     * interface to match existing functions, with the `description` field being the
     * transformed command/command with options.
     *
     * @example
     *  {
     *      command: "testdb",
     *      description: "dotnet --cli -- test db migrate",
     *  }
     *
     * @param {CommandDefinition} commandDefinition Command definition where the 'command' field
     * is the desired alias value, and the 'description' field is the transformed command/option string.
     * @param {boolean} overrideIfRegistered If true, subsequent registrations of a command
     * with the same name will override the last. Otherwise, a warning will be displayed and the
     * original command will remain.
     * @returns `this` for chaining
     */
    registerAlias(commandDefinition, overrideIfRegistered = false) {
        // Ensure we are able to register the given command based on name + configuration
        if (
            !_validateCommandRegistration(
                commandDefinition,
                overrideIfRegistered
            )
        ) {
            return this;
        }

        const {
            command: alias,
            description: transformedCommand,
        } = commandDefinition;

        // Filter out the registered command of the same name incase it is already registered
        // If it is not already registered, this should have no effect.
        this.removeCommand(alias);
        _registerCommand({
            command: alias,
            description: `${ALIAS_PREFIX} ${transformedCommand}`,
        });

        return this;
    },

    /**
     * Registers command aliases from the current `package.json`, if any are found.
     *
     * To add aliases via the package.json file, add entries in this structure:
     *
     * @example
     * {
     *     "and-cli": {
     *          "aliases": {
     *              "testdb": "dotnet --cli -- test db migrate",
     *          },
     *      },
     *  },
     *
     * @param {boolean} overrideIfRegistered If true, subsequent registrations of a command
     * with the same name will override the last. Otherwise, a warning will be displayed and the
     * original command will remain.
     * @returns `this` for chaining
     */
    registerAliasesFromConfig(overrideIfRegistered = false) {
        const { aliases } = packageConfig.getLocalAndCliConfigOrDefault();
        const aliasKeys = Object.keys(aliases);

        if (CollectionUtils.isEmpty(aliasKeys)) {
            return this;
        }

        aliasKeys.forEach((key) => {
            this.registerAlias(
                {
                    command: key,
                    description: aliases[key],
                },
                overrideIfRegistered
            );
        });

        return this;
    },

    /**
     * Registers a single base command by name available from the `and-cli` with the program.
     *
     * Note: Prints an error if the specified command name is not found.
     *
     * @param {string} name Name of the base command to register
     * @param {boolean} [overrideIfRegistered=false] If true, subsequent registrations of a command
     * with the same name will override the last. Otherwise, a warning will be displayed and the
     * original command will remain.
     * @returns `this` for chaining
     */
    registerBaseCommand(name, overrideIfRegistered = false) {
        const baseCommand = _validateAndGetBaseCommand(name);

        if (baseCommand == null) {
            return this;
        }

        // Ensure we are able to register the given command based on name + configuration
        if (!_validateCommandRegistration(baseCommand, overrideIfRegistered)) {
            return this;
        }

        // Filter out the registered command of the same name incase it is already registered
        // If it is not already registered, this should have no effect.
        this.removeCommand(name);
        _registerCommand(baseCommand, true);

        return this;
    },

    /**
     * Registers all of the base commands available from the `and-cli` with the program.
     * @param {boolean} [overrideIfRegistered=false] If true, subsequent registrations of a command
     * with the same name will override the last. Otherwise, a warning will be displayed and the
     * original command will remain.
     *
     * @returns `this` for chaining
     */
    registerBaseCommands(overrideIfRegistered = false) {
        BASE_COMMAND_DEFINITIONS.forEach((commandDefinition) => {
            const { command } = commandDefinition;

            this.registerBaseCommand(command, overrideIfRegistered);
        });

        return this;
    },

    /**
     * Register a single command with the program.
     *
     * @param {CommandDefinition} commandDefinition
     * @param {boolean} [overrideIfRegistered=false] If true, subsequent registrations of a command
     * with the same name will override the last. Otherwise, a warning will be displayed and the
     * original command will remain.
     * @returns `this` for chaining
     */
    registerCommand(commandDefinition, overrideIfRegistered = false) {
        // Ensure we are able to register the given command based on name + configuration
        if (
            !_validateCommandRegistration(
                commandDefinition,
                overrideIfRegistered
            )
        ) {
            return this;
        }

        // Filter out the registered command of the same name incase it is already registered
        // If it is not already registered, this should have no effect.
        this.removeCommand(commandDefinition.command);
        _registerCommand(commandDefinition, false);

        return this;
    },

    /**
     * Register a set of commands with the program.
     *
     * @param {CommandDefinition[]} [commands] Array of CommandDefinitions to register with the application
     * @param {boolean} [overrideIfRegistered=false] If true, subsequent registrations of a command
     * with the same name will override the last. Otherwise, a warning will be displayed and the
     * original command will remain.
     * @returns `this` for chaining
     */
    registerCommands(commands, overrideIfRegistered = false) {
        if (CollectionUtils.isEmpty(commands)) {
            return this;
        }

        commands.forEach((command) =>
            this.registerCommand(command, overrideIfRegistered)
        );

        return this;
    },

    /**
     * Removes a command from the program by name.
     *
     * @param {string} name
     * @returns `this` for chaining
     */
    removeCommand(name) {
        if (StringUtils.isEmpty(name)) {
            return;
        }

        program.commands = program.commands.filter(
            (registeredCommand) =>
                !_commandEqualsByName(registeredCommand, name)
        );

        return this;
    },
};

// #endregion Public Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = commandRegistry;

// #endregion Exports
