/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const file  = require("./file");
const path  = require("path");
const shell = require("shelljs");


/**************************************************************************************************
 * Variables
 **************************************************************************************************/

//
let cachedSolutionPath;

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
};

// #endregion Functions


/**************************************************************************************************
 * Exports
 **************************************************************************************************/

module.exports = dotnetPath;