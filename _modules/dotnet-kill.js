// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const child_process = require("child_process");
const echo          = require("./echo");
const ps            = require("./ps");
const shell         = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const dotnetKill = {
    cmd() {
        return {
            args: ["build-server", "shutdown"],
            cmd:  "dotnet",
            toString() {
                return `${this.cmd} ${this.args.join(" ")}`;
            },
        };
    },
    description() {
        return `Forcefully kills any running dotnet processes (see https://github.com/dotnet/cli/issues/1327)`;
    },
    async run() {
        const { cmd, args } = this.cmd();

        echo.message(`Stopping dotnet build servers via (${this.cmd()})...`);
        const { status, stderr } = child_process.spawnSync(cmd, args, { stdio: "inherit", shell: true });
        if (status !== 0) {
            echo.error(`There was an error shutting down the MSBuild server: ${status} ${stderr}`);
            shell.exit(status);
        }

        echo.success("Finished shutting down build servers.");

        // Manually gathering process ID list and filtering results vs. just deferring to fkill
        // with a string - something with the regex pattern they are using is invalid in node v8
        const psListResult = await ps.list("dotnet");

        const dotnetPids = psListResult.map((e) => e.pid);
        if (dotnetPids.length === 0) {
            echo.message("No dotnet PIDs found!");
            return 0;
        }

        echo.message(`Force killing dotnet PIDs ${dotnetPids}...`);

        await ps.kill(dotnetPids);

        echo.success("Finished force killing lingering dotnet processes.");
    },
}

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = dotnetKill;

// #endregion Exports
