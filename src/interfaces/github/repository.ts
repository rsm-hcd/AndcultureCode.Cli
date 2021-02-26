import { User } from "./user";

// -----------------------------------------------------------------------------------------
// #region Interfaces
// -----------------------------------------------------------------------------------------

/**
 * A stripped down representation of the repository objects returned by the Github API.
 */
interface Repository {
    description: string;
    fork: boolean;
    full_name: string;
    id: number;
    name: string;
    owner: User;
    ssh_url: string;
    topics: string[];
    url: string;
}

// #endregion Interfaces

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { Repository };

// #endregion Exports
