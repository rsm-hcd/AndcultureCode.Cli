import child_process from "child_process";
import shell from "shelljs";
import { CommandStringBuilder } from "../utilities/command-string-builder";
import { OptionStringBuilder } from "../utilities/option-string-builder";
import { Echo } from "./echo";

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

        const { cmd, args } = this.cmd();
        const { status } = child_process.spawnSync(cmd, args, {
            stdio: "inherit",
            shell: true,
        });

        if (status != null && status !== 0) {
            Echo.error(`Exited with error: ${status}`);
            shell.exit(status);
        }

        Echo.success("npm packages restored");
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { NodeRestore };

// #endregion Exports
