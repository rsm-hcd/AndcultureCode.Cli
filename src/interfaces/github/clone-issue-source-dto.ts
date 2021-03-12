// -----------------------------------------------------------------------------------------
// #region Interface
// -----------------------------------------------------------------------------------------

/**
 * Defines an issue to be used as the source for cloning
 */
interface CloneIssueSourceDto {
    number: number;
    owner: string;
    repo: string;
}

// #endregion Interface

// -----------------------------------------------------------------------------------------
// #region Export
// -----------------------------------------------------------------------------------------

export { CloneIssueSourceDto };

// #endregion Export
