// -----------------------------------------------------------------------------------------
// #region Interface
// -----------------------------------------------------------------------------------------

/**
 * An object defining a command for the program, with the command name and description.
 */
interface CommandDefinition {
    /**
     * Name of the command to run
     */
    command: string;

    /**
     * Short description of what the command can be used for
     */
    description: string;
}

// #endregion Interface

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { CommandDefinition };

// #endregion Exports
