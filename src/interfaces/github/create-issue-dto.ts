// -----------------------------------------------------------------------------------------
// #region Interface
// -----------------------------------------------------------------------------------------

/**
 * Interface derived from the `IssuesCreateEndpoint` type provided by the generated octokit type definitions
 */
interface CreateIssueDto {
    assignees?: string[];
    assignee?: string;
    body?: string;
    labels?: string[];
    milestone?: number;
    owner: string;
    repo: string;
    title: string;
}

// #endregion Interface

// -----------------------------------------------------------------------------------------
// #region Export
// -----------------------------------------------------------------------------------------

export { CreateIssueDto };

// #endregion Export
