// -----------------------------------------------------------------------------------------
// #region Interface
// -----------------------------------------------------------------------------------------

interface GitPushOptions {
    /**
     * Do everything except actually send the updates.
     * @see https://git-scm.com/docs/git-push#Documentation/git-push.txt---dry-run
     */
    dryRun?: boolean;
}

// #endregion Interface

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { GitPushOptions };

// #endregion Exports
