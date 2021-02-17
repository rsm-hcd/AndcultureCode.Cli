import { StringUtils } from "andculturecode-javascript-core";
import program from "commander";

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

let _default: program.Command = program;

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Public Functions
// -----------------------------------------------------------------------------------------

/**
 * Utility functions related to working with `program.Command` objects
 */
const CommandUtils = {
    /**
     * Returns true if the command matches the given name (case insensitive)
     *
     * @param name Name of the command for comparison
     * @param command Command for comparison
     * @returns {boolean}
     */
    equalsByName(name: string, command?: program.Command): boolean {
        command = _getOrDefault(command);
        return command.name().toLowerCase() === name.toLowerCase();
    },

    /**
     * Returns whether or not a command of the matching name (case-insensitive) is registered under
     * the provided command
     *
     * @param {program.Command} command Command to check
     * @param {string} name Name of the command to find
     */
    exists(name: string, command?: program.Command): boolean {
        command = _getOrDefault(command);
        return this.get(name, command) != null;
    },

    /**
     * Returns a registered command by name. If the command is not registered under the
     * provided command, returns `undefined`
     *
     * @param command Command to retrieve from
     * @param name Name of the command to retrieve
     */
    get(name: string, command?: program.Command): program.Command | undefined {
        if (StringUtils.isEmpty(name)) {
            return undefined;
        }

        command = _getOrDefault(command);

        return command.commands.find((subcommand: program.Command) =>
            this.equalsByName(name, subcommand)
        );
    },

    /**
     * Removes a subcommand from the provided command by name.
     *
     * @param command Command to remove from
     * @param name Name of the command to remove
     */
    remove(name: string, command?: program.Command): program.Command {
        command = _getOrDefault(command);
        if (StringUtils.isEmpty(name) || !this.exists(name, command)) {
            return command;
        }

        command.commands = command.commands.filter(
            (subcommand: program.Command) =>
                !this.equalsByName(name, subcommand)
        );

        return command;
    },

    /**
     * Sets the default command to be used when not passed in as a parameter to any of the
     * functions in this utility module.
     *
     * @default program
     * @param command Command to be used as the default
     *
     * @returns `this` for chaining
     */
    setDefault(command: program.Command) {
        _default = command;
        return this;
    },

    /**
     * Sorts the underlying command list alphabetically by name
     */
    sort(command?: program.Command): program.Command {
        command = _getOrDefault(command);
        command.commands = command.commands.sort(
            (commandA: program.Command, commandB: program.Command) =>
                commandA.name().localeCompare(commandB.name())
        );

        return command;
    },
};

// #endregion Public Functions

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

const _getOrDefault = (command?: program.Command): program.Command =>
    command ?? _default;

// #endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { CommandUtils };

// #endregion Exports
