import { CommandStringBuilder } from "../utilities/command-string-builder";
import { Dir } from "./dir";
import { FrontendPath } from "./frontend-path";
import shell from "shelljs";
import { NodeClean } from "./node-clean";
import { NodeRestore } from "./node-restore";
import { Echo } from "./echo";
import child_process from "child_process";

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const COMMAND = new CommandStringBuilder("npm", "run", "start");

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Public Functions
// -----------------------------------------------------------------------------------------

const Webpack = {
    cmd(): CommandStringBuilder {
        return COMMAND;
    },
    description(): string {
        return `Runs the webpack project (via ${this.cmd()}}) found in ${FrontendPath.projectDir()}`;
    },
    run(clean: boolean = false, restore: boolean = false) {
        Dir.pushd(FrontendPath.projectDir());

        const cleanWithoutRestore = clean && !restore;

        if (clean) {
            NodeClean.run();
        }

        // Webpack won't be able to start up without restoring after a clean
        if (cleanWithoutRestore) {
            return;
        }

        if (restore) {
            NodeRestore.run();
        }

        const { cmd, args } = this.cmd();

        Echo.message(`Running frontend (via ${this.cmd()})...`);
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
};

// #endregion Public Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { Webpack };

// #endregion Exports
