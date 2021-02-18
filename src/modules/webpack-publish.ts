import shell, { ExecOutputReturnValue } from "shelljs";
import { WebpackRestoreOptions } from "../interfaces/webpack-restore-options";
import { CommandStringBuilder } from "../utilities/command-string-builder";
import { OptionStringBuilder } from "../utilities/option-string-builder";
import { Echo } from "./echo";
import { FrontendPath } from "./frontend-path";
import { NodeCI } from "./node-ci";
import { NodeClean } from "./node-clean";
import { NodeRestore } from "./node-restore";

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const WebpackPublish = {
    cmd(): CommandStringBuilder {
        return new CommandStringBuilder("npm", "run", "build");
    },
    description(): string {
        return `Publishes a release build of the frontend project (via ${this.cmd()}) in ${FrontendPath.projectDir()}`;
    },
    getOptions(): OptionStringBuilder {
        return new OptionStringBuilder("publish", "p");
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
        Echo.message(
            `Cleaning publish directory ${FrontendPath.publishDir()}...`
        );

        shell.rm("-rf", FrontendPath.publishDir());

        Echo.success("Publish directory cleaned");

        // Change directory into frontend folder
        shell.pushd(FrontendPath.projectDir());

        this.restore(options);

        // Build frontend
        Echo.message(`Building frontend (via ${this.cmd()})...`);

        const result = shell.exec(this.cmd().toString(), {
            silent: false,
        }) as ExecOutputReturnValue;

        if (result.code === 0) {
            Echo.success("Frontend built successfully");
        } else {
            Echo.error("Failed to build frontend");
        }

        shell.popd();

        return result.code === 0;
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { WebpackPublish };

// #endregion Exports
