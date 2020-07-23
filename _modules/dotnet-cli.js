// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

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
    cmd() {
        if (!dotnetPath.cliPath()) return "";
        return `dotnet ${path.basename(dotnetPath.cliPath())}`;
    },
    description() {
        return `Shortcut that forwards any/all LMS Dotnet Cli commands to be run in the correct location in the project (via ${this.cmd()}) ` +
            tabbedNewLine(red("NOTE: ") + "Arguments need to be wrapped in quotes, ie \"test database migrate\"");
    },
    run(args) {
        const cliDir = dotnetPath.cliDir();

        // Build dotnet project if the *Cli.dll is not found
        if (cliDir === undefined || cliDir === null) {
            echo.warn("No Cli.dll found. Building project");
            dotnetBuild.run(true, true);
        }

        dir.pushd(dotnetPath.cliDir());

        // Dynamically find the latest dotnet core bin so that upgrades won't break this command
        const fullCommand = `${this.cmd()} ${args}`;
        echo.success(`Full command:` + fullCommand);
        const {code} = shell.exec(fullCommand);
        if (code !== 0) {
            echo.error("Command failed, see output for details.");
            shell.exit(code);
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