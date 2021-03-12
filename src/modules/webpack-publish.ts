import shell, { ExecOutputReturnValue } from "shelljs";
import { WebpackRestoreOptions } from "../interfaces/webpack-restore-options";
import { CommandStringBuilder } from "../utilities/command-string-builder";
import { OptionStringBuilder } from "../utilities/option-string-builder";
import { Echo } from "./echo";
import { FrontendPath } from "./frontend-path";
import { NodeCI } from "./node-ci";
import { NodeClean } from "./node-clean";
import { NodeRestore } from "./node-restore";
import { Options } from "../constants/options";
import child_process from "child_process";

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const COMMAND = new CommandStringBuilder("npm", "run", "build");

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const WebpackPublish = {
    cmd(): CommandStringBuilder {
        return COMMAND;
    },
    description(): string {
        return `Publishes a release build of the frontend project (via ${this.cmd()}) in ${FrontendPath.projectDir()}`;
    },
    getOptions(): OptionStringBuilder {
        return Options.Publish;
    },
    restore(options: WebpackRestoreOptions): void {
        const ci = options.ci ?? false;
        const clean = !options.skipClean ?? true;
        const restore = !options.skipRestore ?? true;

        if (ci) {
            NodeCI.run();
            return;
        }

        if (clean) {
            NodeClean.run();
        }

        if (restore) {
            NodeRestore.run();
        }
    },
    run(options: WebpackRestoreOptions): boolean {
        // Clean publish directory
        const publishDir = FrontendPath.publishDir();
        Echo.message(`Cleaning publish directory ${publishDir}...`);

        const { code: cleanStatus } = shell.rm("-rf", publishDir);
        if (cleanStatus !== 0) {
            Echo.error(`Failed to clean ${publishDir} dir: ${cleanStatus}`);
            shell.exit(cleanStatus);
        }

        Echo.success("Publish directory cleaned");

        // Change directory into frontend folder
        shell.pushd(FrontendPath.projectDir());

        this.restore(options);

        // Build frontend
        Echo.message(`Building frontend (via ${this.cmd()})...`);
        const { cmd, args } = this.cmd();
        const { status: buildStatus } = child_process.spawnSync(cmd, args, {
            stdio: "inherit",
            shell: true,
        });

        shell.popd();

        if (buildStatus != null && buildStatus !== 0) {
            Echo.error("Failed to build frontend");
            shell.exit(buildStatus);
        }

        Echo.success("Frontend built successfully");
        return true;
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { WebpackPublish };

// #endregion Exports
