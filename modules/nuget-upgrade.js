// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const constants = require("./constants");
const dotnetPath = require("./dotnet-path");
const echo = require("./echo");
const formatters = require("./formatters");
const shell = require("shelljs");
const userPrompt = require("./user-prompt");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const nugetUpgrade = {
    matchingProjects: [],
    packageName: "",
    packageVersion: "",
    prompt: null,
    description() {
        return "Prompts the user to specify a NuGet package to upgrade for all projects in a solution.";
    },
    findCsprojFiles() {
        const solutionDir = dotnetPath.solutionDir();

        echo.message("Looking for csproj files under the current directory...");

        const findResult = shell.find(`${solutionDir}/**/*.csproj`);
        if (findResult.code !== 0) {
            echo.error(constants.ERROR_READING_CSPROJ_FILES);
            shell.exit(findResult.code);
        }

        return findResult;
    },
    getCsprojFilesContainingPackage(csprojFiles) {
        echo.message(`Looking for packages matching '${this.packageName}'...`);

        const grepResult = shell.grep("-l", this.packageName, csprojFiles);
        if (grepResult.code !== 0) {
            echo.error(constants.ERROR_READING_CSPROJ_FILES);
            shell.exit(grepResult.code);
        }

        const matchingProjects = grepResult.stdout
            .split("\n")
            .filter((result) => result.trim() !== "");
        if (matchingProjects.length === 0) {
            echo.message(
                `No projects found with package '${this.packageName}'. Exiting.`
            );
            shell.exit(1);
        }

        return matchingProjects;
    },
    async promptForConfirmation() {
        echo.message(
            `${formatters.red(
                this.matchingProjects.length
            )} projects found with package '${this.packageName}'.`
        );
        await userPrompt.confirmOrExit("Continue?");
        this.replacePackageVersion();
    },
    async promptForPackageName() {
        const packageName = await this.prompt.questionAsync(
            "Please enter a package to upgade: "
        );
        return this.validatePackageName(packageName);
    },
    async promptForPackageVersion() {
        const packageVersion = await this.prompt.questionAsync(
            `Please enter a version to upgrade '${this.packageName}' to: `
        );
        return this.validatePackageVersion(packageVersion);
    },
    replacePackageVersion() {
        const sedResult = shell.sed(
            "-i",
            `(<PackageReference[ ]*Include[ ]*=[ ]*\"${this.packageName}\"[ ]*Version[ ]*=[ ]*\")([0-9]+.[0-9]+.[0-9]+)`,
            `$1${this.packageVersion}`,
            this.matchingProjects
        );
        if (sedResult.code !== 0) {
            echo.error(
                `There was an error updating csproj files: ${sedResult}`
            );
            shell.exit(sedResult.code);
        }

        echo.success(
            `Successfully updated '${this.packageName}' to version ${this.packageVersion}. Please check your git status before committing.`
        );
        return 0;
    },
    async run() {
        // Ensure we are in a directory that has a dotnet solution.
        dotnetPath.solutionPathOrExit();

        // Retrieve the cached prompt interface so we don't have multiple streams of input
        this.prompt = userPrompt.getPrompt();

        // Ask for the package name & version to upgrade
        this.packageName = await this.promptForPackageName();
        this.packageVersion = await this.promptForPackageVersion();

        // Find all of the csproj files and then narrow down the results to those that actually
        // require the package.
        const csprojFiles = this.findCsprojFiles();
        this.matchingProjects = this.getCsprojFilesContainingPackage(
            csprojFiles
        );

        // Finally, confirm the operation from the user to replace the package in those files
        await this.promptForConfirmation();
    },
    validatePackageName(packageName) {
        if (packageName == null || packageName.trim() === "") {
            echo.error("Please enter a valid package name.");
            shell.exit(1);
        }

        return packageName.trim();
    },
    validatePackageVersion(packageVersion) {
        if (
            packageVersion == null ||
            !packageVersion.match(constants.VERSION_REGEX_PATTERN)
        ) {
            echo.error(constants.ERROR_INVALID_VERSION_STRING);
            shell.exit(1);
        }

        return packageVersion;
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = nugetUpgrade;

// #endregion Exports
