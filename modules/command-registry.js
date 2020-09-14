// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const { CLI_NAME, NODE_MODULES } = require("./constants");
const {
    StringUtils,
    CollectionUtils,
} = require("andculturecode-javascript-core");
const commands = require("./commands");
const echo = require("./echo");
const path = require("path");
const program = require("commander");
const shell = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

/**
 * Flattened array of CommandDefinitions from the base project. (see 'commands' module)
 *
 * @type {CommandDefinition[]}
 */
const BASE_COMMAND_DEFINITIONS = Object.keys(commands).map(
    (key) => commands[key]
);

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
 * Returns a path to the executable file for a given command, based on whether the application is
 * being imported or run directly.
 * @param {string} commandName The name of the command to build a file path for.
 */
const _getExecutablePath = (commandName) => {
    const filename = `${CLI_NAME}-${commandName}.js`;
    if (_isImportedModule != null && _isImportedModule) {
        // Returns './node_modules/and-cli/and-cli-dotnet.js, for example
        return path.join(".", NODE_MODULES, CLI_NAME, filename);
    }

    // Otherwise, default to files in the current project directory
    return path.join(".", filename);
};

/**
 * Sorts the command list alphabetically by name
 */
const _sortCommandsByName = () => {
    program.commands = program.commands.sort(
        (commandA, commandB) =>
            commandA.name().toLowerCase() > commandB.name().toLowerCase()
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
