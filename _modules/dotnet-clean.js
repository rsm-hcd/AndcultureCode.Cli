// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const child_process = require("child_process");
const dir           = require("./dir");
const dotnetPath    = require("./dotnet-path");
const echo          = require("./echo");
const shell         = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const dotnetClean = {
    cmd() {
        return {
            args: ["clean", dotnetPath.solutionDir()],
            cmd: "dotnet",
            toString() {
                return `${this.cmd} ${this.args.join(" ")}`;
            },
        };
    },
    description() {
        return `Clean the dotnet solution from the root of the project (via ${this.cmd()})`;
    },
    run() {
        // Verify that the solution path exists or exit early.
        dotnetPath.solutionPathOrExit();

        dir.pushd(dotnetPath.solutionDir());

        // We clean 'bin' and 'obj' directories first incase they are preventing the SLN from building
        echo.message("Recursively deleting 'bin' directories...");
        const binDirs = shell.find(".").filter((e) => {
            if (e.startsWith(".git"))       { return false; } // If sln is on the root of repo, we must avoid cleaning .git
            if (e.includes("node_modules")) { return false; } // Disregard any in node_modules directories
            return e.match("bin");
        });

        if (binDirs.length > 0) {
            const { code } = shell.rm("-rf", binDirs);

            if (code !== 0) {
                echo.error(`Failed to delete 'bin' directories: ${code}`);
                shell.exit(code);
            }
        }
        echo.success("'bin' directories deleted successfully!");

        echo.message("Recursively deleting 'obj' directories...");
        const objDirs = shell.find(".").filter((e) => {
            if (e.startsWith(".git"))       { return false; } // If sln is on the root of repo, we must avoid cleaning .git
            if (e.includes("node_modules")) { return false; } // Disregard any in node_modules directories
            return e.match("obj");
        });

        if (objDirs.length > 0) {
            const { code } = shell.rm("-rf", objDirs);

            if (code !== 0) {
                echo.error(`Failed to delete 'obj' directories: ${code}`);
                shell.exit(code);
            }
        }
        echo.success("'obj' directories deleted successfully!");

        dir.popd();

        const { cmd, args } = this.cmd();

        // Now we let the dotnet cli clean
        echo.message(`Running dotnet clean (via ${this.cmd()}) on the solution...`);

        const { status } = child_process.spawnSync(cmd, args, { stdio: "inherit", shell: true });

        if (status !== 0) {
            echo.error("Solution failed to clean. See output for details.");
            shell.exit(status);
        }

        echo.success("Dotnet solution cleaned");
    },
}

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = dotnetClean;

// #endregion Exports