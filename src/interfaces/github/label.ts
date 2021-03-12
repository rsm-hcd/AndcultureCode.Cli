// -----------------------------------------------------------------------------------------
// #region Interface
// -----------------------------------------------------------------------------------------

/**
 * A stripped down representation of the label objects returned by the Github API.
 */
interface Label {
    id: number;
    node_id: string;
    url: string;
    name: string;
    description: string;
    color: string;
    default: boolean;
}

// #endregion Interface

// -----------------------------------------------------------------------------------------
// #region Export
// -----------------------------------------------------------------------------------------

export { Label };

// #endregion Export
