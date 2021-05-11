// -----------------------------------------------------------------------------------------
// #region Interface
// -----------------------------------------------------------------------------------------

interface ListCommandsOptions {
    /**
     * Include the --help option for each command
     */
    includeHelp?: boolean;

    /**
     * Number of spaces to indent each level
     */
    indent?: number;

    /**
     * Prefix to display before each command/option
     */
    prefix?: string;

    /**
     * Skip attempting to read cached command list file
     */
    skipCache?: boolean;

    /** Colorize command/options in output */
    useColor?: boolean;
}

// #endregion Interface

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { ListCommandsOptions };

// #endregion Exports
