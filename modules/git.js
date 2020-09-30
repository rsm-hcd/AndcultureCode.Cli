// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const echo = require("./echo");
const fs = require("fs");
const shell = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Public Members
// -----------------------------------------------------------------------------------------

const git = {
    /**
     *
     * @param {string} repo Absolute HTTPS or SSH repository URL
     * @param {*} prefix Prefix for destination folder '{FOLDER_PREFIX}.{REPOSITORY_NAME}'
     */
    clone(repo, prefix) {
        if (repo == null || repo.trim() === "") {
            return false;
        }

        const name = repo.name;
        const folder = prefix != null ? `${prefix}.${name}` : name;

        const cloneResult = shell.exec(`git clone ${repo.ssh_url} ${folder}`);
        if (cloneResult.code !== 0) {
            echo.error(`Failed to clone '${name}'. `);
            return false;
        }

        return true;
    },
    description() {
        return `Helpful git operations used at andculture`;
    },
};

// #endregion Public Members

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

//#endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = git;

// #endregion Exports
