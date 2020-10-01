// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const echo = require("./echo");
const fs = require("fs");
const os = require("os");
const shell = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Public Members
// -----------------------------------------------------------------------------------------

const browser = {
    /**
     * Opens the supplied URL in the system's default browser
     * @param {string} url absolute url
     */
    open(url) {
        const command = os.platform() === "win32" ? "start" : "open";
        shell.exec(`${command} ${url}`);
    },
};

// #endregion Public Members

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = browser;

// #endregion Exports
