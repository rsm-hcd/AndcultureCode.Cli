// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const child_process = require("child_process");
const dotnetPath    = require("./dotnet-path");
const echo          = require("./echo");
const shell         = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const dotnetRestore = {
    cmd() {
        return {
            args: ["restore", dotnetPath.solutionPath()],
            cmd: "dotnet",
            toString() {
                return `${this.cmd} ${this.args.join(" ")}`;
            },
        };
    },
    description() {
        return `Restore the dotnet solution from the root of the project (via ${this.cmd()})`;
    },
    run() {
        // Verify that the solution path exists or exit early.
        dotnetPath.solutionPathOrExit();

        const { cmd, args } = this.cmd();

        echo.message(`Restoring nuget packages (via ${this.cmd()})...`);

        const { status } = child_process.spawnSync(cmd, args, { stdio: "inherit", shell: true });
        if (status !== 0) {
            echo.error("Solution failed to restore. See output for details.");
            shell.exit(status);
        }

        echo.success("Dotnet solution restored");

        return status;
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = dotnetRestore;

// #endregion Exports
