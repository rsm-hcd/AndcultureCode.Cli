// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const { CollectionUtils } = require("andculturecode-javascript-core");
const child_process = require("child_process");
const commandStringFactory = require("../utilities/command-string-factory");
const dir = require("./dir");
const dotnetPath = require("./dotnet-path");
const echo = require("./echo");
const optionStringFactory = require("../utilities/option-string-factory");
const shell = require("shelljs");

// #endregion Imports

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
const _getMatchingPaths = (dir) =>
    shell.find(".").filter((path) => {
        if (path.startsWith(".git")) {
            return false;
        } // If sln is on the root of repo, we must avoid cleaning .git
        if (path.includes("node_modules")) {
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
const _recursiveRm = (dir) => {
    echo.message(`Recursively deleting '${dir}' directories...`);

    const directories = _getMatchingPaths(dir);

    if (CollectionUtils.isEmpty(directories)) {
        echo.message(
            `No '${dir}' directories found - skipping this clean step.`
        );
        return;
    }

    const { code } = shell.rm("-rf", directories);

    if (code !== 0) {
        echo.error(`Failed to delete '${dir}' directories: ${code}`);
        shell.exit(code);
    }

    echo.success(`'${dir}' directories deleted successfully!`);
};

// #endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Public Functions
// -----------------------------------------------------------------------------------------

const dotnetClean = {
    cmd() {
        return commandStringFactory.build(
            "dotnet",
            "clean",
            dotnetPath.solutionDir()
        );
    },
    description() {
        return `Clean the dotnet solution from the root of the project (via ${this.cmd()})`;
    },
    getOptions() {
        return optionStringFactory.build("clean", "-c");
    },
    run() {
        // Verify that the solution path exists or exit early.
        dotnetPath.solutionPathOrExit();

        dir.pushd(dotnetPath.solutionDir());

        // We clean 'bin' and 'obj' directories first incase they are preventing the SLN from building
        _recursiveRm("bin");
        _recursiveRm("obj");

        dir.popd();

        const { cmd, args } = this.cmd();

        // Now we let the dotnet cli clean
        echo.message(
            `Running dotnet clean (via ${this.cmd()}) on the solution...`
        );

        const { status } = child_process.spawnSync(cmd, args, {
            stdio: "inherit",
            shell: true,
        });

        if (status !== 0) {
            echo.error("Solution failed to clean. See output for details.");
            shell.exit(status);
        }

        echo.success("Dotnet solution cleaned");
    },
};

// #endregion Public Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = dotnetClean;

// #endregion Exports
