import { CommandStringBuilder } from "../utilities/command-string-builder";
import { OptionStringBuilder } from "../utilities/option-string-builder";
import { Constants } from "./constants";
import { Echo } from "./echo";
import shell from "shelljs";

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const NodeClean = {
    cmd(): CommandStringBuilder {
        return new CommandStringBuilder("rm", "-rf", Constants.NODE_MODULES);
    },
    description() {
        return `Clean the npm dependencies (via ${this.cmd()}) in the current directory`;
    },
    getOptions(): OptionStringBuilder {
        return new OptionStringBuilder("clean", "c");
    },
    run() {
        Echo.message(
            `Recursively deleting '${
                Constants.NODE_MODULES
            }' directory in ${shell.pwd()}...`
        );

        shell.rm("-rf", Constants.NODE_MODULES);

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
