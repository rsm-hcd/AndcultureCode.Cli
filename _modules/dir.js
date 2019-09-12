/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const echo  = require("./echo");
const fs    = require("fs");
const shell = require("shelljs");


/**************************************************************************************************
 * Functions
 **************************************************************************************************/

// #region Dir commands

const dir = {
    /**
     * Deletes the directory provided it exists
     * @param {string} dir Relative or absolute path to directory
     */
    deleteIfExists(dir) {
        if (!fs.existsSync(dir)) {
            echo.message(`Directory '${dir}' does not exist. Nothing to delete.`);
            return;
        }

        shell.rm("-rf", dir);
        echo.success(`Directory '${dir}' successfully deleted`);
    },
    popd(dir) {
        shell.popd("-q", dir);
    },
    pushd(dir) {
        shell.pushd("-q", dir);
    }
}

// #endregion Dir commands


/**************************************************************************************************
 * Exports
 **************************************************************************************************/

module.exports = dir;