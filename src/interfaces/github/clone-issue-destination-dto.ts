import { CloneIssueSourceDto } from "./clone-issue-source-dto";

// -----------------------------------------------------------------------------------------
// #region Interface
// -----------------------------------------------------------------------------------------

/**
 * Defines a destination for an issue to be cloned to
 */
interface CloneIssueDestinationDto
    extends Omit<CloneIssueSourceDto, "number"> {}

// #endregion Interface

// -----------------------------------------------------------------------------------------
// #region Export
// -----------------------------------------------------------------------------------------

export { CloneIssueDestinationDto };

// #endregion Export
