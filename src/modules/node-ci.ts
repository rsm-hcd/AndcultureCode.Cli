import shell from "shelljs";
import { CommandStringBuilder } from "../utilities/command-string-builder";
import { OptionStringBuilder } from "../utilities/option-string-builder";
import { Echo } from "./echo";

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const NodeCI = {
    cmd(): CommandStringBuilder {
        return new CommandStringBuilder("npm", "ci");
    },
    description() {
        return `Clean and restore npm dependencies (via ${this.cmd()}) in the current directory`;
    },
    getOptions(): OptionStringBuilder {
        return new OptionStringBuilder("ci");
    },
    run() {
        Echo.message(
            `Restoring npm packages (via ${this.cmd()}) in ${shell.pwd()}...`
        );
        shell.exec(this.cmd().toString(), { silent: false });
        Echo.success("npm packages restored");
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { NodeCI };

// #endregion Exports
