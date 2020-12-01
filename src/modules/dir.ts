import { Echo } from "./echo";
import fs from "fs";
import shell from "shelljs";

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const Dir = {
    /**
     * Deletes the directory provided it exists
     * @param {string} dir Relative or absolute path to directory
     */
    deleteIfExists(dir: string) {
        if (!fs.existsSync(dir)) {
            Echo.message(
                `Directory '${dir}' does not exist. Nothing to delete.`
            );
            return;
        }

        shell.rm("-rf", dir);
        Echo.success(`Directory '${dir}' successfully deleted`);
    },
    popd() {
        shell.popd("-q");
    },
    pushd(dir: string) {
        shell.pushd("-q", dir);
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { Dir };

// #endregion Exports
