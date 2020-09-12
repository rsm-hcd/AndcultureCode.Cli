// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

/** Constant to hold a reference to name of the CLI so we aren't hard-coding it multiple places */
module.exports.CLI_NAME = "and-cli";

/** Constant to hold a reference to the name of the entrypoint/main file */
module.exports.ENTRYPOINT = `${this.CLI_NAME}.js`;

/** Output to be prefixed on messages sent to echo.error() */
module.exports.ERROR_OUTPUT_STRING = "[ERROR]";

/** Standardized error message for an invalid package version string */
module.exports.ERROR_INVALID_VERSION_STRING =
    "Invalid package version string (see https://docs.microsoft.com/en-us/nuget/concepts/package-versioning)";

/** Standardized error message when an error occurs while reading csproj files */
module.exports.ERROR_READING_CSPROJ_FILES =
    "There was an error reading csproj files.";

/** Constant to hold the standard 'help' flag description */
module.exports.HELP_DESCRIPTION = "display help for command";

/** Constant to hold the standard help flags for commands */
module.exports.HELP_OPTIONS = ["-h", "--help"];

/** Constant to hold the 'node_modules' directory string */
module.exports.NODE_MODULES = "node_modules";

/** Constant to hold the standard 'unknown command' output from Commander when parsing arguments */
module.exports.UNKNOWN_COMMAND = "unknown command";

/** Semver regex pattern for validating version number (see https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string) */
module.exports.VERSION_REGEX_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

/** Output string to be prefixed on messages sent to echo.warn() */
module.exports.WARN_OUTPUT_STRING = "[WARN]";

// #endregion Exports
