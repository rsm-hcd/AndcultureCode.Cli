import shell from "shelljs";
import { CommandStringBuilder } from "../utilities/command-string-builder";
import { OptionStringBuilder } from "../utilities/option-string-builder";
import { Constants } from "./constants";
import { Echo } from "./echo";

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
