import { CommandStringBuilder } from "../utilities/command-string-builder";
import { OptionStringBuilder } from "../utilities/option-string-builder";
import { Dir } from "./dir";
import { DotnetClean } from "./dotnet-clean";
import { DotnetPath } from "./dotnet-path";
import { DotnetRestore } from "./dotnet-restore";
import child_process from "child_process";
import { Echo } from "./echo";
import shell from "shelljs";

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const RUN_OPTION: OptionStringBuilder = new OptionStringBuilder("run", "r");
const WATCH_OPTION: OptionStringBuilder = new OptionStringBuilder("watch", "w");
const DOTNET_OPTIONS: Record<string, OptionStringBuilder> = {
    RUN: RUN_OPTION,
    WATCH: WATCH_OPTION,
};

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

let _clean = false;
let _option = DOTNET_OPTIONS.RUN;
let _restore = false;

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const Dotnet = {
    cmd(option = DOTNET_OPTIONS.RUN): CommandStringBuilder {
        const runString = option === DOTNET_OPTIONS.WATCH ? "watch run" : "run";
        return new CommandStringBuilder("dotnet", runString, "--no-restore");
    },
    description(option = DOTNET_OPTIONS.RUN) {
        const webProjectFilePath =
            DotnetPath.webProjectFilePath() || "<web project path>";
        return `Runs the dotnet project (via ${this.cmd(
            option
        )}) for ${webProjectFilePath}`;
    },
    getOptions() {
        return DOTNET_OPTIONS;
    },
    run() {
        // Verify that the solution path exists or exit early.
        DotnetPath.solutionPathOrExit();

        if (_clean) {
            DotnetClean.run();
        }

        if (_restore) {
            DotnetRestore.run();
        }

        Dir.pushd(DotnetPath.webProjectFileDir()!);

        // Since the spawnSync function takes the base command and all arguments separately, we cannot
        // leverage the base dotnet command string here. We'll build out the arg list in an array.
        const { cmd, args } = this.cmd(_option);

        Echo.message(`Running dotnet (via ${this.cmd(_option)})...`);
        const { status } = child_process.spawnSync(cmd, args, {
            stdio: "inherit",
            shell: true,
        });

        if (status != null && status !== 0) {
            Echo.error(`Exited with error: ${status}`);
            shell.exit(status);
        }

        Dir.popd();
    },
    setClean(clean = false) {
        if (clean != null) {
            _clean = clean;
        }
        return this;
    },
    setOption(option = DOTNET_OPTIONS.RUN) {
        if (option != null) {
            _option = option;
        }
        return this;
    },
    setRestore(restore = false) {
        if (restore != null) {
            _restore = restore;
        }
        return this;
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { Dotnet };

// #endregion Exports
