
/**************************************************************************************************
 * Variables
 **************************************************************************************************/

/** Standardized error message for an invalid package version string */
module.exports.ERROR_INVALID_VERSION_STRING = "Invalid package version string (see https://docs.microsoft.com/en-us/nuget/concepts/package-versioning)";

/** Standardized error message when an error occurs while reading csproj files */
module.exports.ERROR_READING_CSPROJ_FILES = "There was an error reading csproj files.";

/** Semver regex pattern for validating version number (see https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string) */
module.exports.VERSION_REGEX_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;