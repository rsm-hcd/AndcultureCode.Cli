import { CommandStringBuilder } from "../utilities/command-string-builder";
import { DotnetPath } from "./dotnet-path";
import { Echo } from "./echo";
import child_process from "child_process";
import shell from "shelljs";
import { OptionStringBuilder } from "../utilities/option-string-builder";
import { Options } from "../constants/options";

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const COMMAND = new CommandStringBuilder(
    "dotnet",
    "restore",
    DotnetPath.solutionPath() ?? ""
);

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const DotnetRestore = {
    cmd(): CommandStringBuilder {
        return COMMAND;
    },
    description(): string {
        return `Restore the dotnet solution from the root of the project (via ${this.cmd()})`;
    },
    getOptions(): OptionStringBuilder {
        return Options.Restore;
    },
    run(): number | null {
        // Verify that the solution path exists or exit early.
        DotnetPath.solutionPathOrExit();

        const { cmd, args } = this.cmd();

        Echo.message(`Restoring nuget packages (via ${this.cmd()})...`);

        const { status } = child_process.spawnSync(cmd, args, {
            stdio: "inherit",
            shell: true,
        });
        if (status != null && status !== 0) {
            Echo.error("Solution failed to restore. See output for details.");
            shell.exit(status);
        }

        Echo.success("Dotnet solution restored");

        return status;
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { DotnetRestore };

// #endregion Exports
