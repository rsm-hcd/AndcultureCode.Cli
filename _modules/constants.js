
/**************************************************************************************************
 * Variables
 **************************************************************************************************/

/** Standardized error message for an invalid package version string */
const _errorInvalidVersionString = "Invalid package version string (see https://docs.microsoft.com/en-us/nuget/concepts/package-versioning)";

/** Standardized error message when an error occurs while reading csproj files */
const _errorReadingCsprojFiles = "There was an error reading csproj files.";

/** Semver regex pattern for validating version number (see https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string) */
const _versionRegexPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;


/**************************************************************************************************
 * Exports
 **************************************************************************************************/
exports.ERROR_INVALID_VERSION_STRING = _errorInvalidVersionString;
exports.ERROR_READING_CSPROJ_FILES = _errorReadingCsprojFiles;
exports.VERSION_REGEX_PATTERN = _versionRegexPattern;