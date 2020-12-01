// -----------------------------------------------------------------------------------------
// #region Types
// -----------------------------------------------------------------------------------------

/**
 * An object defining a command for the program, with the command name and description.
 */
type CommandDefinition = {
    /**
     * Name of the command to run
     */
    command: string;

    /**
     * Short description of what the command can be used for
     */
    description: string;
};

// #endregion Types

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { CommandDefinition };

// #endregion Exports
