import { CollectionUtils } from "andculturecode-javascript-core";
import { CommandStringBuilder } from "../utilities/command-string-builder";
import { OptionStringBuilder } from "../utilities/option-string-builder";
import { DotnetPath } from "./dotnet-path";
import { Echo } from "./echo";
import shell, { ShellString } from "shelljs";
import { Constants } from "./constants";

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const NUGET_URL = "https://api.nuget.org/v3/index.json";
const SOLUTION_PATH = DotnetPath.solutionPath() ?? "";

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Public Functions
// -----------------------------------------------------------------------------------------

const NugetPublish = {
    description() {
        return "Publishes NuGet packages for dotnet core projects";
    },
    getOptions() {
        return new OptionStringBuilder("publish <version>", "p");
    },
    run(version: string) {
        // Verify the solution path can be found or exit
        DotnetPath.solutionPathOrExit();

        if (!version.match(Constants.VERSION_REGEX_PATTERN)) {
            Echo.error(Constants.ERROR_INVALID_VERSION_STRING);
            shell.exit(1);
            return;
        }

        Echo.message(`Publishing version '${version}'...`);

        // Update version number in .csproj files
        const updateVersion = _replaceCsprojVersion(version);
        shell.ls("**/*.csproj").forEach(updateVersion);

        // Create new nupkg file
        const packCmd = _packCmd();
        Echo.message(`Packaging ${SOLUTION_PATH}... (via ${packCmd})`);
        if (shell.exec(packCmd.toString()).code !== 0) {
            Echo.error("Failed to pack dotnet project");
            shell.exit(1);
        }

        // Push nupkg to nuget servers
        const results = shell
            .ls(`**/*.${version}.nupkg`)
            .map(publishNugetPackage);

        const errors = results
            .filter((result: ShellString) => result.code !== 0)
            .map((result: ShellString) => result.stderr);

        // Error output
        if (CollectionUtils.hasValues(errors)) {
            Echo.error(
                `Failed to publish ${
                    errors.length
                } nuget package(s): ${JSON.stringify(errors)}`
            );
            shell.exit(1);
        }

        Echo.success(`Successfully published version ${version}`);
    },
};

// #endregion Public Functions

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

const _packCmd = () => new CommandStringBuilder("dotnet", "pack");

const _publishCmd = (file: string) =>
    new CommandStringBuilder("dotnet", "nuget", "push", file, "-s", NUGET_URL);

const publishNugetPackage = (file: string): ShellString => {
    const publishCmd = _publishCmd(file);
    Echo.message(`Publishing package ${file}... (via ${publishCmd})`);

    const result = shell.exec(publishCmd.toString());
    if (result.code !== 0) {
        Echo.error(`[FAILED] Publishing nuget package: '${file}'`);
        return result;
    }

    Echo.success(`[SUCCESS] Publishing nuget package: '${file}'`);
    return result;
};

const _replaceCsprojVersion = (version: string) => (file: string) =>
    shell.sed(
        "-i",
        "<Version>(.*)</Version>",
        `<Version>${version}</Version>`,
        file
    );

// #endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { NugetPublish };

// #endregion Exports
