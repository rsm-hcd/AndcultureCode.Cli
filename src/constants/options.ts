import { OptionStringBuilder } from "../utilities/option-string-builder";

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const Clean = new OptionStringBuilder("clean", "c");
const Help = new OptionStringBuilder("help", "h");
const Publish = new OptionStringBuilder("publish", "p");
const Restore = new OptionStringBuilder("restore", "R");

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Public Members
// -----------------------------------------------------------------------------------------

const Options = {
    Clean,
    Help,
    Publish,
    Restore,
};

// #endregion Public Members

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { Options };

// #endregion Exports
