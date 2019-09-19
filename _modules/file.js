/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const echo  = require("./echo");
const fs    = require("fs");
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
     * Deletes the file provided it exists
     * @param {string} file Relative or absolute path to file
     */
    deleteIfExists(file) {
        if (!fs.existsSync(file)) {
            echo.message(`File '${file}' does not exist. Nothing to delete.`);
            return;
        }

        shell.rm("-f", file);
        echo.success(`File '${file}' successfully deleted`);
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