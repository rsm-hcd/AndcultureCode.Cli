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
     * Clone a git repository
     * @param {string} name Name of repository being cloned
     * @param {string} url Absolute HTTPS or SSH repository URL
     * @param {string} prefix Prefix for destination folder '{FOLDER_PREFIX}.{REPOSITORY_NAME}'
     */
    clone(name, url, prefix) {
        if (name == null || name.trim() === "") {
            return false;
        }

        if (url == null || url.trim() === "") {
            return false;
        }

        const folder = this.getCloneDirectoryName(name, prefix);
        const cloneResult = shell.exec(`git clone ${url} ${folder}`, {
            silent: true,
        });
        if (cloneResult.code !== 0) {
            echo.error(`Failed to clone '${name}' - ${cloneResult.stderr}`);
            return false;
        }

        return true;
    },

    /**
     * Constructs target folder name given a repo and optional prefix
     * @param {string} repoName short name of repository
     * @param {string} prefix optional prefix
     */
    getCloneDirectoryName(repoName, prefix) {
        if (repoName == null || repoName.trim() === "") {
            return "";
        }

        return prefix != null ? `${prefix}.${repoName}` : repoName;
    },

    /**
     * Checks if the repository is cloned for the supplied combination
     * @param {string} repoName short name of repository
     * @param {string} prefix optional prefix
     */
    isCloned(repoName, prefix) {
        const folder = git.getCloneDirectoryName(repoName, prefix);
        return fs.existsSync(folder);
    },

    /**
     * Opens the supplied URL in the system's default browser
     * @param {string} url absolute url
     */
    openWebBrowser(url) {
        shell.exec(`git web--browse ${url}`);
    },
};

// #endregion Public Members

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = git;

// #endregion Exports
