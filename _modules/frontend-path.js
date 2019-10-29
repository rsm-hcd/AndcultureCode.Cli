/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const path  = require("path");
const upath = require("upath");


/**************************************************************************************************
 * Functions
 **************************************************************************************************/

// #region Functions

const frontendPath = {

    /**
     * Retrieves the frontend project's folder path
     */
    projectDir() {
        return "frontend";
    },

    /**
     * Retrieves the frontend project's release folder path
     */
    publishDir() {
        return upath.toUnix(path.join(this.projectDir(), "build"));
    },

};

// #endregion Functions


/**************************************************************************************************
 * Exports
 **************************************************************************************************/

module.exports = frontendPath;
