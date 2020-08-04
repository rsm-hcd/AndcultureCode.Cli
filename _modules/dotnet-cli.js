// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------
const child_process          = require("child_process");
const dir                    = require("./dir");
const dotnetBuild            = require("./dotnet-build");
const dotnetPath             = require("./dotnet-path");
const echo                   = require("./echo");
const formatters             = require("./formatters");
const path                   = require("path");
const shell                  = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

const { red, tabbedNewLine } = formatters;

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const dotnetCli = {
    cmd(cliArgs) {
        return {
            args: [path.basename(dotnetPath.cliPath() || "")].concat(cliArgs.split(" ")),
            cmd: "dotnet",
            toString() {
                return `${this.cmd} ${this.args.join(" ")}`;
            },
        };
    },
    description() {
        return `Shortcut that forwards any/all LMS Dotnet Cli commands to be run in the correct location in the project (via ${this.cmd("")}) ` +
            tabbedNewLine(red("NOTE: ") + "Arguments need to be wrapped in quotes, ie \"test database migrate\"");
    },
    run(cliArgs) {
        const cliDir = dotnetPath.cliDir();

        // Build dotnet project if the *Cli.dll is not found
        if (cliDir === undefined || cliDir === null) {
            echo.warn("No Cli.dll found. Building project");
            dotnetBuild.run(true, true);
        }

        dir.pushd(dotnetPath.cliDir());

        // Dynamically find the latest dotnet core bin so that upgrades won't break this command

        const { cmd, args } = this.cmd(cliArgs);

        echo.success(`Full command:` + this.cmd(cliArgs).toString());
        const { status } = child_process.spawnSync(cmd, args, { stdio: "inherit", shell: true });

        if (status !== 0) {
            echo.error("Command failed, see output for details.");
            shell.exit(status);
        }

        dir.popd();
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = dotnetCli;

// #endregion Exports