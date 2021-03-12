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

    /**
     * Map containing nested command definitions. These cannot be registered at the top level program
     * and instead will need to be registered in the parent command's executable file. For example,
     * the `aws-s3` command nested under `deploy` is registered in `and-cli-deploy.ts`.
     */
    children?: Record<string, CommandDefinition>;
}

// #endregion Interface

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { CommandDefinition };

// #endregion Exports
