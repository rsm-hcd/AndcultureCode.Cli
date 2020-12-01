import child_process from "child_process";
import { Echo } from "./echo";
import shell from "shelljs";
import { CommandStringBuilder } from "../utilities/command-string-builder";
import { DotnetPath } from "./dotnet-path";
import { OptionStringBuilder } from "../utilities/option-string-builder";
import { DotnetClean } from "./dotnet-clean";
import { DotnetRestore } from "./dotnet-restore";

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const DotnetBuild = {
    cmd(): CommandStringBuilder {
        return new CommandStringBuilder(
            "dotnet",
            "build",
            DotnetPath.solutionPath() ?? "",
            "--no-restore"
        );
    },
    description(): string {
        return `Builds the dotnet project (via ${this.cmd()})`;
    },
    getOptions(): OptionStringBuilder {
        return new OptionStringBuilder("build", "b");
    },
    run(clean: boolean, restore: boolean) {
        // Verify that the solution path exists or exit early.
        DotnetPath.solutionPathOrExit();

        if (clean) {
            DotnetClean.run();
        }

        if (restore) {
            DotnetRestore.run();
        }

        const { cmd, args } = this.cmd();

        Echo.message(`Building solution (via ${this.cmd()})...`);
        const { status } = child_process.spawnSync(cmd, args, {
            stdio: "inherit",
            shell: true,
        });

        if (status != null && status !== 0) {
            Echo.error("Solution failed to build. See output for details.");
            shell.exit(status);
        }

        return status;
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { DotnetBuild };

// #endregion Exports
