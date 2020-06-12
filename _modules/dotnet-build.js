// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const child_process = require("child_process");
const dotnetClean   = require("./dotnet-clean");
const dotnetPath    = require("./dotnet-path");
const dotnetRestore = require("./dotnet-restore");
const echo          = require("./echo");
const shell         = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const dotnetBuild = {
    cmd() {
        return {
            args: ["build", dotnetPath.solutionPath(), "--no-restore"],
            cmd: "dotnet",
            toString() {
                return `${this.cmd} ${this.args.join(" ")}`;
            },
        };
    },
    options() {
        return ["-b", "--build"];
    },
    description() {
        return `Builds the dotnet project (via ${this.cmd()})`;
    },
    run(clean, restore) {
        // Verify that the solution path exists or exit early.
        dotnetPath.solutionPathOrExit();

        if (clean) {
            dotnetClean.run();
        }

        if (restore) {
            dotnetRestore.run();
        }

        const { cmd, args } = this.cmd();

        echo.message(`Building solution (via ${this.cmd()})...`);
        const { status } = child_process.spawnSync(cmd, args, { stdio: "inherit", shell: true });

        if (status !== 0) {
            echo.error("Solution failed to build. See output for details.");
            shell.exit(status);
        }

        return status;
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = dotnetBuild;

// #endregion Exports