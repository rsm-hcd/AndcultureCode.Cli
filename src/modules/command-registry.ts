import { StringUtils, CollectionUtils } from "andculturecode-javascript-core";
import shell from "shelljs";
import { Formatters } from "./formatters";
import upath from "upath";
import program, { Command } from "commander";
import { Echo } from "./echo";
import { CommandDefinition } from "../interfaces/command-definition";
import { PackageConfig } from "./package-config";
import { Constants } from "./constants";
import { CommandDefinitionUtils } from "../utilities/command-definition-utils";
import { CommandUtils } from "../utilities/command-utils";

// -----------------------------------------------------------------------------------------
// #region Interfaces
// -----------------------------------------------------------------------------------------

interface CommandRegistryConfiguration {
    /**
     * Boolean flag to determine whether the application is being run directly or as a required package.
     *
     * Determines how base commands are registered (whether they are located in the node_modules
     * folder, or the current project directory)
     *
     * @default false
     */
    isImportedModule?: boolean;
}

// #endregion Interfaces

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

/**
 * Informational prefix to display before aliased commands in the help menu
 */
const ALIAS_PREFIX = Formatters.purple("(alias)");

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

let _cachedConfig: CommandRegistryConfiguration = {};

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Public Functions
// -----------------------------------------------------------------------------------------

const CommandRegistry = {
    ALIAS_PREFIX,
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
     * Update the configuration for the registry. Can be called multiple times as long as the value
     * of 'isImportedModule' is only provided once, or stays the same.
     *
     * @param config Object with various configuration options for the registry
     *
     * @returns `this` for chaining
     */
    configure(config: CommandRegistryConfiguration) {
        _validateConfigurationOrExit(config);
        _cachedConfig = { ..._cachedConfig, ...config };
        return this;
    },

    /**
     * Returns a registered command by name. If the command is not registered, returns `undefined`
     *
     * @param {string} name
     */
    get(name: string): program.Command | undefined {
        return CommandUtils.get(name);
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
        Echo.message(
            `Matched alias '${Formatters.purple(
                command
            )}', executing '${Formatters.purple(description)}'`
        );

        const transformedArgs = description.split(" ");
        program.parse(transformedArgs, { from: "user" });
    },

    /**
     * Register a single command with the program.
     *
     * @param {CommandDefinition} definition
     * @param {boolean} [overrideIfRegistered=false] If true, subsequent registrations of a command
     * with the same name will override the last. Otherwise, a warning will be displayed and the
     * original command will remain.
     *
     * @returns `this` for chaining
     */
    register(
        definition: CommandDefinition,
        overrideIfRegistered: boolean = false
    ) {
        // Ensure we are able to register the given command based on name + configuration
        if (!_validate(definition, overrideIfRegistered)) {
            return this;
        }

        // Filter out the registered command of the same name incase it is already registered
        // If it is not already registered, this should have no effect.
        this.remove(definition.command);
        _register(definition, false);

        return this;
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
     * @param definition Command definition where the 'command' field is the desired alias value,
     * and the 'description' field is the transformed command/option string.
     * @param overrideIfRegistered If true, subsequent registrations of a command
     * with the same name will override the last. Otherwise, a warning will be displayed and the
     * original command will remain.
     *
     * @returns `this` for chaining
     */
    registerAlias(
        definition: CommandDefinition,
        overrideIfRegistered: boolean = false
    ) {
        // Ensure we are able to register the given command based on name + configuration
        if (!_validate(definition, overrideIfRegistered)) {
            return this;
        }

        const { command: alias, description: transformedCommand } = definition;

        // Filter out the registered command of the same name incase it is already registered
        // If it is not already registered, this should have no effect.
        this.remove(alias);
        _register({
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
     * @param overrideIfRegistered If true, subsequent registrations of a command
     * with the same name will override the last. Otherwise, a warning will be displayed and the
     * original command will remain.
     *
     * @returns `this` for chaining
     */
    registerAliasesFromConfig(overrideIfRegistered: boolean = false) {
        const { aliases } = PackageConfig.getLocalAndCliConfigOrDefault();
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
     * Register a set of commands with the program.
     *
     * @param definitions Collection of CommandDefinitions to register with the application
     * @param overrideIfRegistered If true, subsequent registrations of a command
     * with the same name will override the last. Otherwise, a warning will be displayed and the
     * original command will remain.
     *
     * @returns `this` for chaining
     */
    registerAll(
        definitions:
            | CommandDefinition[]
            | (Record<string, CommandDefinition> | undefined),
        overrideIfRegistered: boolean = false
    ) {
        definitions = Array.isArray(definitions)
            ? definitions
            : CommandDefinitionUtils.flatten(definitions);

        if (CollectionUtils.isEmpty(definitions)) {
            return this;
        }

        definitions.forEach((definition: CommandDefinition) =>
            this.register(definition, overrideIfRegistered)
        );

        return this;
    },

    /**
     * Registers all of the base commands available from the `and-cli` with the program.
     * @param overrideIfRegistered If true, subsequent registrations of a command
     * with the same name will override the last. Otherwise, a warning will be displayed and the
     * original command will remain.
     *
     * @returns `this` for chaining
     */
    registerAllBase(overrideIfRegistered: boolean = false) {
        CommandDefinitionUtils.flatten().forEach((definition) => {
            const { command } = definition;

            this.registerBase(command, overrideIfRegistered);
        });

        return this;
    },

    /**
     * Registers a single base command by name available from the `and-cli` with the program.
     *
     * Note: Prints an error if the specified command name is not found.
     *
     * @param name Name of the base command to register
     * @param overrideIfRegistered If true, subsequent registrations of a command
     * with the same name will override the last. Otherwise, a warning will be displayed and the
     * original command will remain.
     *
     * @returns `this` for chaining
     */
    registerBase(name: string, overrideIfRegistered: boolean = false) {
        const baseCommand = _validateAndGetBaseDefinition(name);

        if (baseCommand == null) {
            return this;
        }

        // Ensure we are able to register the given command based on name + configuration
        if (!_validate(baseCommand, overrideIfRegistered)) {
            return this;
        }

        // Filter out the registered command of the same name incase it is already registered
        // If it is not already registered, this should have no effect.
        this.remove(name);
        _register(baseCommand, true);

        return this;
    },

    /**
     * Removes a command from the program by name.
     *
     * @param name Name of the command to remove
     * @returns `this` for chaining
     */
    remove(name: string) {
        CommandUtils.remove(name);
        return this;
    },
};

// #endregion Public Functions

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

/**
 * Returns the registered aliases as command definitions, with the prefix text stripped out
 */
const _getAliasCommandDefinitions = (): CommandDefinition[] => {
    const aliasCommands = program.commands.filter((command: program.Command) =>
        command.description().startsWith(ALIAS_PREFIX)
    );

    return aliasCommands.map((aliasCommand: program.Command) => {
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

const _getBaseDefinitionOrExit = (
    name: string
): CommandDefinition | undefined => {
    if (CommandDefinitionUtils.exists(name)) {
        return CommandDefinitionUtils.get(name);
    }

    const commandNames = CommandDefinitionUtils.toCsv();

    Echo.error(
        `The specified command '${name}' was not found. Available commands are: ${commandNames}`
    );
    shell.exit(1);
    // Returning here for the purpose of testing, shell.exit will kill the process in a normal run
    return undefined;
};

/**
 * Returns a path to the executable file for a given command, based on whether the application is
 * being imported or run directly.
 * @param {string} commandName The name of the command to build a file path for.
 */
const _getExecutablePath = (commandName: string): string => {
    const filename = `${Constants.CLI_NAME}-${commandName}.js`;
    if (_cachedConfig.isImportedModule === true) {
        // Returns './node_modules/and-cli/dist/and-cli-dotnet.js', for example
        return upath.join(
            ".",
            Constants.NODE_MODULES,
            Constants.CLI_NAME,
            Constants.DIST,
            filename
        );
    }

    // Otherwise, default to files in the current project directory
    return upath.join(".", filename);
};

/**
 * Pre-processes the argv string array and return the corresponding command if any defined aliases
 * match the given input
 */
const _preprocessArgsForAliases = (): CommandDefinition | undefined => {
    const aliases = _getAliasCommandDefinitions();
    if (CollectionUtils.isEmpty(aliases)) {
        return undefined;
    }

    // Expecting three values from process.argv, ie: /bin/node and-cli.js <alias>
    const expectedArgCount = 3;
    if (CollectionUtils.length(process.argv) !== expectedArgCount) {
        return undefined;
    }

    // Cloning with spread operator to avoid mutating original process.argv reference
    const lastArg = [...process.argv].pop();

    // Return the alias command that matches the given input, or undefined
    return aliases.find(
        (alias: CommandDefinition) => alias.command === lastArg
    );
};

/**
 * Registers a command, taking into consideration whether the command is a base command or a local command.
 *
 * This function assumes the command is valid & ready to be registered.
 *
 * @param isBaseCommand Flag to determine whether we're registering a base command or a local command
 */
const _register = (
    definition: CommandDefinition,
    isBaseCommand: boolean = false
): void => {
    const { command, description } = definition;

    if (!isBaseCommand) {
        program.command(command, description);
        CommandUtils.sort();
        return;
    }

    // See `commander.ExecutableCommandOptions`
    program.command(command, description, {
        executableFile: _getExecutablePath(command),
    });

    CommandUtils.sort();
};

const _validateName = (name?: string) => {
    if (StringUtils.hasValue(name)) {
        return true;
    }

    const commandNames = CommandDefinitionUtils.toCsv();

    Echo.error(
        `Command name is required. Available commands are: ${commandNames}`
    );

    shell.exit(1);
    // Returning here for the purpose of testing, shell.exit will kill the process in a normal run
    return false;
};

/**
 * Validates that the given command name has a value, and exists in the base command definition array,
 * returning the found definition (or exiting if provided invalid input)
 */
const _validateAndGetBaseDefinition = (
    name: string
): CommandDefinition | undefined => {
    if (!_validateName(name)) {
        return undefined;
    }

    return _getBaseDefinitionOrExit(name);
};

/**
 * Validates a command registration based on whether a command of the same name is already registered,
 * and if the consumer has opted in to overriding it.
 */
const _validate = (
    commandDefinition: CommandDefinition,
    overrideIfRegistered: boolean = false
) => {
    const { command } = commandDefinition;

    // First, check to see if command is already registered.
    if (!CommandUtils.exists(command) || overrideIfRegistered) {
        return true;
    }

    Echo.warn(
        `Command '${command}' has already been registered and 'overrideIfRegistered' is set to false. Skipping this command registration.`
    );
    return false;
};

/**
 * Ensures the configure function is called with the 'isImportedModule' property once, or its value
 * remains the same.
 */
const _validateConfigurationOrExit = (config: CommandRegistryConfiguration) => {
    const { isImportedModule } = config;
    const { isImportedModule: cachedIsImportedModule } = _cachedConfig;

    if (
        isImportedModule == null ||
        cachedIsImportedModule == null ||
        isImportedModule === cachedIsImportedModule
    ) {
        return;
    }

    Echo.error(
        "CommandRegistry.configure() should only be called with 'isImportedModule' set once."
    );
    shell.exit(1);
};

// #endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { CommandRegistry };

// #endregion Exports
