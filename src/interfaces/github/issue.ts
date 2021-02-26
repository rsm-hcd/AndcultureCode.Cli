import { Label } from "./label";
import { User } from "./user";

// -----------------------------------------------------------------------------------------
// #region Interfaces
// -----------------------------------------------------------------------------------------

/**
 * A stripped down representation of the issue objects returned by the Github API.
 */
interface Issue {
    id: number;
    node_id: string;
    url: string;
    repository_url: string;
    labels_url: string;
    comments_url: string;
    events_url: string;
    html_url: string;
    number: number;
    state: string;
    title: string;
    body: string;
    user: User;
    labels: Label[];
    assignee: User;
    assignees: User[];
    locked: boolean;
    active_lock_reason: string;
    comments: number;
    pull_request: {
        url: string;
        html_url: string;
        diff_url: string;
        patch_url: string;
    };
    closed_at: string;
    created_at: string;
    updated_at: string;
}

// #endregion Interfaces

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { Issue };

// #endregion Exports
