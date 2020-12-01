import shell from "shelljs";

// -----------------------------------------------------------------------------------------
// #region Public Functions
// -----------------------------------------------------------------------------------------

const CommandRunner = {
    /**
     * Runner method for cli commands. Awaits the 'body' of the command function and calls shell.exit
     * automatically, to prevent any lingering asynchronous work from a module.
     *
     * @param {() => any} fn Function that contains the command logic.
     */
    async run(fn: Function) {
        await fn();
        shell.exit(0);
    },
};

// #endregion Public Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { CommandRunner };

// #endregion Exports
