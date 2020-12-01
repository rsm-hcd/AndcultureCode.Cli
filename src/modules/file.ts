import shell from "shelljs";
import { Echo } from "./echo";
import fs from "fs";

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

let cachedBashFile: string | undefined;

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const File = {
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
    deleteIfExists(file: string) {
        if (!fs.existsSync(file)) {
            Echo.message(`File '${file}' does not exist. Nothing to delete.`);
            return;
        }

        shell.rm("-f", file);
        Echo.success(`File '${file}' successfully deleted`);
    },

    /**
     * Returns the first match of the provided file expression
     * @param {string} fileExpression
     */
    first(fileExpression: string) {
        shell.config.silent = true;
        const result = shell.ls(fileExpression)[0];
        shell.config.reset();
        return result;
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { File };

// #endregion Exports
