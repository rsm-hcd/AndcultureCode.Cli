import { CommandStringBuilder } from "../utilities/command-string-builder";
import { OptionStringBuilder } from "../utilities/option-string-builder";
import { Echo } from "./echo";
import { FrontendPath } from "./frontend-path";
import { NodeClean } from "./node-clean";
import { NodeRestore } from "./node-restore";
import shell, { ExecOutputReturnValue } from "shelljs";

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
    run(): boolean {
        // Clean publish directory
        Echo.message(
            `Cleaning publish directory ${FrontendPath.publishDir()}...`
        );

        shell.rm("-rf", FrontendPath.publishDir());

        Echo.success("Publish directory cleaned");

        // Change directory into frontend folder
        shell.pushd(FrontendPath.projectDir());

        // Clean and restore node dependencies
        NodeClean.run();
        NodeRestore.run();

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
