// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const echo = require("./echo");
const file = require("./file");
const path = require("path");
const shell = require("shelljs");
const upath = require("upath");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

/**
 * Representse the directory where a Presentation.Cli dll would live after a `dotnet build`
 */
const cliFilePath = "Presentation/Cli/bin/Debug/**/*Cli.dll";

/**
 * Wild-card searches used when finding the infrastructure/data dotnet core application project file. Ordered by most to least performant
 */
const dataProjectFilePaths = [
    "*.csproj",
    "dotnet/*/Infrastructure/Data.SqlServer/Data.SqlServer.csproj",
    "dotnet/*/Infrastructure/Data.*/Data.*.csproj",
    "**/Data*.csproj",
    "**/*.csproj"
];

/**
 * Represents the 'release' directory for a `dotnet build`
 */
const releaseDirectory = "release";

/**
 * Wild-card searches used when finding the solution file. Ordered by most to least performant
 */
const solutionFilePaths = [
    "*.sln",
    "dotnet/*.sln",
    "dotnet/*/*.sln",
    "**/*.sln"
];

/**
 * Wild-card searches used when finding the web dotnet core application project file. Ordered by most to least performant
 */
const webProjectFilePaths = [
    "*.csproj",
    "dotnet/*/Presentation/Web/Web.csproj",
    "**/*Web.csproj",
    "**/*.csproj"
];

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

let cachedCliPath;
let cachedDataProjectPath;
let cachedSolutionPath;
let cachedWebProjectFilePath;

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const dotnetPath = {
    CLI_FILE_PATH: cliFilePath,
    RELEASE_DIRECTORY: releaseDirectory,
    /**
     * Retrieves the dotnet cli's assembly directory path
     */
    cliDir() {
        const cliPath = this.cliPath();
        if (cliPath == null) {
            return undefined;
        }

        return path.dirname(cliPath);
    },

    /**
     * Retrieves the dotnet cli's assembly path
     */
    cliPath() {
        if (cachedCliPath != null) {
            return cachedCliPath;
        }

        const solutionDir = this.solutionDir();
        if (solutionDir == null) {
            return undefined;
        }

        const cliFilePath = upath.toUnix(path.join(solutionDir, this.CLI_FILE_PATH))
        cachedCliPath = file.first(cliFilePath);

        return cachedCliPath;
    },

    /**
     * Retrieves the dotnet data project file path (memoized)
     */
    dataProjectFilePath() {
        if (cachedDataProjectPath != null) {
            return cachedDataProjectPath;
        }

        for (var filePath of dataProjectFilePaths) {
            cachedDataProjectPath = file.first(filePath);
            if (cachedDataProjectPath != null) {
                return cachedDataProjectPath;
            }
        }

        return undefined;
    },

    /**
     * Retrieves the dotnet data project file path  or exits if it isn't found (memoized)
     */
    dataProjectFilePathOrExit() {
        const dataProjectPath = this.dataProjectFilePath();
        if (dataProjectPath != null) {
            return dataProjectPath;
        }

        echo.error("Unable to find dotnet data project file");
        shell.exit(1);
    },

    /**
     * Retrieves the dotnet solution's release directory path
     */
    releaseDir() {
        const solutionDir = this.solutionDir();
        if (solutionDir == null) {
            return undefined;
        }

        return upath.toUnix(path.join(shell.pwd().toString(), solutionDir, this.RELEASE_DIRECTORY));
    },

    /**
     * Retrieves the dotnet solution's folder path
     */
    solutionDir() {
        const solutionPath = this.solutionPath();
        if (solutionPath == null) {
            return undefined;
        }

        return path.dirname(solutionPath);
    },

    /**
     * Retrieves the dotnet solution file path (memoized)
     */
    solutionPath() {
        if (cachedSolutionPath != null) {
            return cachedSolutionPath;
        }

        for (var filePath of solutionFilePaths) {
            cachedSolutionPath = file.first(filePath);
            if (cachedSolutionPath != null) {
                return cachedSolutionPath;
            }
        }

        return undefined;
    },

    /**
     * Retrieves the dotnet solution file path or exits if it isn't found (memoized)
     */
    solutionPathOrExit() {
        const solutionPath = this.solutionPath();
        if (solutionPath != null) {
            return solutionPath;
        }

        echo.error("Unable to find dotnet solution file");
        shell.exit(1);
    },

    /**
     * Verifies that the `dotnet` executable is installed and returns its path. If `dotnet` cannot
     * be found within the current `PATH`, it returns undefined.
     *
     */
    verify() {
        const dotnetExecutablePath = shell.which("dotnet");
        if (dotnetExecutablePath == null) {
            return undefined;
        }

        return dotnetExecutablePath;
    },

    /**
     * Verifies that the `dotnet` executable is installed or exits if it cannot be found within
     * the current `PATH`
     *
     */
    verifyOrExit() {
        const dotnetExecutablePath = this.verify();
        if (dotnetExecutablePath != null) {
            return dotnetExecutablePath;
        }

        echo.error("Unable to locate dotnet executable. Check your environment path.");
        shell.exit(1);
    },

    /**
     * Retrieves the dotnet web project's folder path
     */
    webProjectFileDir() {
        const webProjectFilePath = this.webProjectFilePath();
        if (webProjectFilePath == null) {
            return undefined;
        }

        return path.dirname(webProjectFilePath);
    },

    /**
     * Retrieves the dotnet web project file path (memoized)
     */
    webProjectFilePath() {
        if (cachedWebProjectFilePath != null) {
            return cachedWebProjectFilePath;
        }

        for (var filePath of webProjectFilePaths) {
            cachedWebProjectFilePath = file.first(filePath);
            if (cachedWebProjectFilePath != null) {
                return cachedWebProjectFilePath;
            }
        }

        return undefined;
    },

    /**
     * Retrieves the dotnet web project file path or exits if it isn't found (memoized)
     */
    webProjectFilePathOrExit() {
        const webProjectFilePath = this.webProjectFilePath();
        if (webProjectFilePath != null) {
            return webProjectFilePath;
        }

        echo.error("Unable to find dotnet web project file");
        shell.exit(1);
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = dotnetPath;

// #endregion Exports
