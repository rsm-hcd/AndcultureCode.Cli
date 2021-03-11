import { StringUtils } from "andculturecode-javascript-core";
import { CommandStringBuilder } from "../utilities/command-string-builder";
import { Dir } from "./dir";
import { DotnetPath } from "./dotnet-path";
import { Echo } from "./echo";
import shell from "shelljs";
import { OptionStringBuilder } from "../utilities/option-string-builder";
import { Options } from "../constants/options";
import child_process from "child_process";

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const ERROR_PUBLISH_FAILED = "Failed to publish dotnet project";
const PUBLISH_SUCCESS = " - Dotnet solution published";

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const DotnetPublish = {
    ERROR_PUBLISH_FAILED,
    PUBLISH_SUCCESS,
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
        return Options.Publish;
    },
    /**
     * Runs a publish of the dotnet solution to the local file system
     * @param {string} absoluteOutputDir Optional absolute path of release output directory. If not provided,
     * defaults to dotnet solution's 'release' directory
     */
    run(absoluteOutputDir?: string) {
        // Verify a solution can be found before attempting to publish
        DotnetPath.solutionPathOrExit();

        if (StringUtils.isEmpty(absoluteOutputDir)) {
            absoluteOutputDir = DotnetPath.releaseDir();
        }

        _cleanReleaseDir(absoluteOutputDir!);

        Dir.pushd(DotnetPath.solutionDir()!);

        _publishSolution(absoluteOutputDir!);

        Dir.popd();
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

const _cleanReleaseDir = (absoluteOutputDir: string) => {
    Echo.message(`Cleaning release directory '${absoluteOutputDir}'...`);
    const { code } = shell.rm("-rf", absoluteOutputDir!);

    if (code === 0) {
        Echo.success(" - Successfully cleaned released directory");
        Echo.newLine();
        return;
    }

    const errorMessage = `Failed to clean release directory '${absoluteOutputDir}': ${code}`;
    Echo.error(errorMessage);
    shell.exit(code);
};

const _publishSolution = (absoluteOutputDir: string) => {
    const commandBuilder = DotnetPublish.cmd(absoluteOutputDir);
    const { cmd, args } = commandBuilder;

    const publishMessage = `Publishing dotnet solution (via ${commandBuilder.toString()})...`;
    Echo.message(publishMessage);

    const { status } = child_process.spawnSync(cmd, args, {
        stdio: "inherit",
        shell: true,
    });

    if (status != null && status !== 0) {
        Echo.error(ERROR_PUBLISH_FAILED);
        shell.exit(status);
    }

    Echo.success(PUBLISH_SUCCESS);
};

// #endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { DotnetPublish };

// #endregion Exports
