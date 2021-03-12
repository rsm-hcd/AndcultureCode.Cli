import { OptionStringBuilder } from "../utilities/option-string-builder";
import { Constants } from "./constants";
import { Echo } from "./echo";
import shell from "shelljs";
import { Options } from "../constants/options";

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const COMMAND = `rm -rf ${Constants.NODE_MODULES}`;

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const NodeClean = {
    description() {
        return `Clean the npm dependencies (via ${COMMAND}) in the current directory`;
    },
    getOptions(): OptionStringBuilder {
        return Options.Clean;
    },
    run() {
        Echo.message(
            `Recursively deleting '${
                Constants.NODE_MODULES
            }' directory in ${shell.pwd()}...`
        );

        const { code } = shell.rm("-rf", Constants.NODE_MODULES);
        if (code != null && code !== 0) {
            Echo.error(`Exited with error: ${code}`);
            shell.exit(code);
        }

        Echo.success(
            `'${Constants.NODE_MODULES}' directory deleted successfully!`
        );
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { NodeClean };

// #endregion Exports
