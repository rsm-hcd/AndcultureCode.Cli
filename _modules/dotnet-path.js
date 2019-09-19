/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const echo  = require("./echo");
const file  = require("./file");
const path  = require("path");
const shell = require("shelljs");
const upath = require("upath");
const pry   = require("pryjs");


/**************************************************************************************************
 * Variables
 **************************************************************************************************/

let cachedCliPath;
let cachedSolutionPath;
let cachedWebProjectFilePath;

// Wild-card searches used when finding the web dotnet core application project file. Ordered by most to least performant
const webProjectFilePaths = [
    "*.csproj",
    "dotnet/*/Presentation/Web/Web.csproj",
    "**/*Web.csproj",
    "**/*.csproj"
];

// Wild-card searches used when finding the solution file. Ordered by most to least performant
const solutionFilePaths = [
    "*.sln",
    "dotnet/*.sln",
    "dotnet/*/*.sln",
    "**/*.sln"
];


/**************************************************************************************************
 * Functions
 **************************************************************************************************/

// #region Functions

const dotnetPath = {

    /**
     * Retrieves the dotnet cli's assembly directory path
     */
    cliDir() {
        if (this.cliPath() === undefined) {
            return undefined;
        }

        return path.dirname(this.cliPath());
    },

    /**
     * Retrieves the dotnet cli's assembly path
     */
    cliPath() {
        if (cachedCliPath) {
            return cachedCliPath;
        }
        // eval(pry.it);
        const solutionPath    = this.solutionDir();
        const cliDebugDirPath = upath.toUnix(path.join(solutionPath, "Presentation/Cli/bin/Debug"));

        cachedCliPath = file.first(`${cliDebugDirPath}/*/*Cli.dll`);

        return cachedCliPath;
    },


    /**
     * Retrieves the dotnet solution's folder path
     */
    solutionDir() {
        return path.dirname(this.solutionPath());
    },

    /**
     * Retrieves the dotnet solution file path (memoized)
     */
    solutionPath() {
        if (cachedSolutionPath !== undefined) {
            return cachedSolutionPath;
        }

        for (var filePath of solutionFilePaths) {
            cachedSolutionPath = file.first(filePath);
            if (cachedSolutionPath !== undefined) {
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
        if (solutionPath !== undefined) {
            return solutionPath;
        }

        echo.error("Unable to find dotnet solution file");
        shell.exit(1);
    },

    /**
     * Retrieves the dotnet web project's folder path
     */
    webProjectFileDir() {
        return path.dirname(this.webProjectFilePath());
    },

    /**
     * Retrieves the dotnet web project file path (memoized)
     */
    webProjectFilePath() {
        if (cachedWebProjectFilePath !== undefined) {
            return cachedWebProjectFilePath;
        }

        for (var filePath of webProjectFilePaths) {
            cachedWebProjectFilePath = file.first(filePath);
            if (cachedWebProjectFilePath !== undefined) {
                return cachedWebProjectFilePath;
            }
        }

        return undefined;
    },
};

// #endregion Functions


/**************************************************************************************************
 * Exports
 **************************************************************************************************/

module.exports = dotnetPath;