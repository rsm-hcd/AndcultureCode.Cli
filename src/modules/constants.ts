// -----------------------------------------------------------------------------------------
// #region Public Members
// -----------------------------------------------------------------------------------------

const Constants = {
    /** Constant to hold the company name, as it is generally cased */
    ANDCULTURE: "andculture",

    /** Constant to hold the company OSS brand, as it is generally cased */
    ANDCULTURE_CODE: "AndcultureCode",

    /** Constant to represent the 'bin' directory or config section */
    BIN: "bin",

    /** Constant to represent the directory for and-cli related configuration files */
    CLI_CONFIG_DIR: ".and-cli",

    /** Constant to hold a reference to name of the CLI so we aren't hard-coding it multiple places */
    CLI_NAME: "and-cli",

    /** Constant to represent the 'dist' directory for built js */
    DIST: "dist",

    /** Constant to hold a reference to the name of the entrypoint/main file */
    ENTRYPOINT: "and-cli.js",

    /** Output to be prefixed on messages sent to echo.error() */
    ERROR_OUTPUT_STRING: "[ERROR]",

    /** Standardized error message for an invalid package version string */
    ERROR_INVALID_VERSION_STRING:
        "Invalid package version string (see https://docs.microsoft.com/en-us/nuget/concepts/package-versioning)",

    /** Standardized error message when an error occurs while reading csproj files */
    ERROR_READING_CSPROJ_FILES: "There was an error reading csproj files.",

    /** Constant to hold the standard 'help' flag description */
    HELP_DESCRIPTION: "display help for command",

    /** Constant to hold the 'node_modules' directory string */
    NODE_MODULES: "node_modules",

    /** Constant to hold the 'obj' directory string */
    OBJ: "obj",

    /** Constant to hold the 'package.json' file string */
    PACKAGE_JSON: "package.json",

    /** Constant to hold the standard 'unknown command' output from Commander when parsing arguments */
    UNKNOWN_COMMAND: "unknown command",

    /** Semver regex pattern for validating version number (see https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string) */
    VERSION_REGEX_PATTERN: /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,

    /** Output string to be prefixed on messages sent to echo.warn() */
    WARN_OUTPUT_STRING: "[WARN]",
};

// #endregion Public Members

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { Constants };

// #endregion Exports
