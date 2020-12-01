import { CommandStringBuilder } from "../utilities/command-string-builder";
import { OptionStringBuilder } from "../utilities/option-string-builder";
import { Echo } from "./echo";
import shell from "shelljs";

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const NodeRestore = {
    cmd(): CommandStringBuilder {
        return new CommandStringBuilder("npm", "install");
    },
    description() {
        return `Restore npm dependencies (via ${this.cmd()}) in the current directory`;
    },
    getOptions(): OptionStringBuilder {
        return new OptionStringBuilder("restore", "R");
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

export { NodeRestore };

// #endregion Exports
