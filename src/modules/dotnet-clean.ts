import { CollectionUtils } from "andculturecode-javascript-core";
import { CommandStringBuilder } from "../utilities/command-string-builder";
import { OptionStringBuilder } from "../utilities/option-string-builder";
import { Constants } from "./constants";
import { Dir } from "./dir";
import { DotnetPath } from "./dotnet-path";
import { Echo } from "./echo";
import child_process from "child_process";
import shell from "shelljs";

// -----------------------------------------------------------------------------------------
// #region Public Functions
// -----------------------------------------------------------------------------------------

const DotnetClean = {
    cmd(): CommandStringBuilder {
        return new CommandStringBuilder(
            "dotnet",
            "clean",
            DotnetPath.solutionDir() ?? ""
        );
    },
    description() {
        return `Clean the dotnet solution from the root of the project (via ${this.cmd()})`;
    },
    getOptions(): OptionStringBuilder {
        return new OptionStringBuilder("clean", "-c");
    },
    run() {
        // Verify that the solution path exists or exit early.
        DotnetPath.solutionPathOrExit();

        Dir.pushd(DotnetPath.solutionDir()!);

        // We clean 'bin' and 'obj' directories first incase they are preventing the SLN from building
        _recursiveRm("bin");
        _recursiveRm("obj");

        Dir.popd();

        const { cmd, args } = this.cmd();

        // Now we let the dotnet cli clean
        Echo.message(
            `Running dotnet clean (via ${this.cmd()}) on the solution...`
        );

        const { status } = child_process.spawnSync(cmd, args, {
            stdio: "inherit",
            shell: true,
        });

        if (status != null && status !== 0) {
            Echo.error("Solution failed to clean. See output for details.");
            shell.exit(status);
        }

        Echo.success("Dotnet solution cleaned");
    },
};

// #endregion Public Functions

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

/**
 * Returns files/directories under the current working directory matching the given name.
 * Skips '.git' and 'node_modules' directories.
 *
 * @param {string} dir
 * @returns
 */
const _getMatchingPaths = (dir: string) =>
    shell.find(".").filter((path: string) => {
        if (path.startsWith(".git")) {
            return false;
        } // If sln is on the root of repo, we must avoid cleaning .git
        if (path.includes(Constants.NODE_MODULES)) {
            return false;
        } // Disregard any in node_modules directories
        return path.match(dir);
    });

/**
 * Safely and recursively removes directories matching the provided name. Skips '.git' and
 * 'node_modules' directories.
 *
 * @param {string} dir
 */
const _recursiveRm = (dir: string) => {
    Echo.message(`Recursively deleting '${dir}' directories...`);

    const directories = _getMatchingPaths(dir);

    if (CollectionUtils.isEmpty(directories)) {
        Echo.message(
            `No '${dir}' directories found - skipping this clean step.`
        );
        return;
    }

    const { code } = shell.rm("-rf", directories);

    if (code !== 0) {
        Echo.error(`Failed to delete '${dir}' directories: ${code}`);
        shell.exit(code);
    }

    Echo.success(`'${dir}' directories deleted successfully!`);
};

// #endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { DotnetClean };

// #endregion Exports
