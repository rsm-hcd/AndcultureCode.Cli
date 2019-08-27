/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const shell = require("shelljs");


/**************************************************************************************************
 * Variables
 **************************************************************************************************/

let cachedBashFile;


/**************************************************************************************************
 * Functions
 **************************************************************************************************/

// #region File commands

const file = {
    /**
     * Returns the correct bash configuration file for the current user
     */
    bashFile() {
        if (cachedBashFile !== undefined) {
            return cachedBashFile;
        }

        cachedBashFile = "~/.bash_profile"; // default

        if (shell.test("-e", "~/.bashrc")) {
            cachedBashFile = "~/.bashrc";
        }

        return cachedBashFile;
    },

    /**
     * Returns the first match of the provided file expression
     * @param {*} fileExpression
     */
    first(fileExpression) {
        shell.config.silent = true;
        const result = shell.ls(fileExpression)[0];
        shell.config.reset();
        return result;
    }
}

// #endregion File commands


/**************************************************************************************************
 * Exports
 **************************************************************************************************/

module.exports = file;