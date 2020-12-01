import { StringUtils } from "andculturecode-javascript-core";
import { CommandStringBuilder } from "../utilities/command-string-builder";
import { Dir } from "./dir";
import { DotnetPath } from "./dotnet-path";
import { Echo } from "./echo";
import shell from "shelljs";
import { OptionStringBuilder } from "../utilities/option-string-builder";

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const DotnetPublish = {
    cmd(outputDirectory?: string): CommandStringBuilder {
        if (StringUtils.isEmpty(outputDirectory)) {
            return new CommandStringBuilder("dotnet", "publish");
        }

        return new CommandStringBuilder(
            "dotnet",
            "publish",
            "-o",
            `"${outputDirectory}"`
        );
    },
    description() {
        return `Publishes the dotnet solution from the root of the project (via ${this.cmd()})`;
    },
    getOptions(): OptionStringBuilder {
        return new OptionStringBuilder("publish", "p");
    },
    /**
     * Runs a publish of the dotnet solution to the local file system
     * @param {string} absoluteOutputDir Optional absolute path of release output directory. If not provided,
     * defaults to dotnet solution's 'release' directory
     */
    run(absoluteOutputDir?: string) {
        if (StringUtils.isEmpty(absoluteOutputDir)) {
            absoluteOutputDir = DotnetPath.releaseDir();
        }

        Echo.message(`Cleaning release directory '${absoluteOutputDir}'...`);
        shell.rm("-rf", absoluteOutputDir!);
        Echo.success(" - Successfully cleaned released directory");
        Echo.newLine();

        Dir.pushd(DotnetPath.solutionDir()!);
        Echo.message(
            `Publishing dotnet solution (via ${this.cmd(absoluteOutputDir)})...`
        );

        if (shell.exec(this.cmd(absoluteOutputDir).toString()).code !== 0) {
            Echo.error("Failed to publish dotnet project");
            shell.exit(1);
        }

        Echo.success(" - Dotnet solution published");
        Dir.popd();
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { DotnetPublish };

// #endregion Exports
