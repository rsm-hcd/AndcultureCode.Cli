// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const child_process = require("child_process");
const commandStringFactory = require("../utilities/command-string-factory");
const dir = require("./dir");
const dotnetBuild = require("./dotnet-build");
const dotnetPath = require("./dotnet-path");
const echo = require("./echo");
const formatters = require("./formatters");
const optionStringFactory = require("../utilities/option-string-factory");
const path = require("path");
const shell = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const dotnetCli = {
    cmd(cliArgs = []) {
        const pathName = path.basename(dotnetPath.cliPath() || "");
        return commandStringFactory.build("dotnet", pathName, ...cliArgs);
    },
    description() {
        return (
            `Shortcut that forwards any/all Dotnet Cli commands to be run in the correct location in the project (via ${this.cmd()}) ` +
            formatters.tabbedNewLine(
                formatters.red("NOTE: ") +
                    "Arguments should be passed through prefixed with '--', ie 'and-cli dotnet --cli -- test db migrate'"
            )
        );
    },
    getOptions() {
        return optionStringFactory.build("cli", "C");
    },
    run(cliArgs = []) {
        const cliDir = dotnetPath.cliDir();

        // Build dotnet project if the *Cli.dll is not found
        if (cliDir == null) {
            echo.warn("No Cli.dll found. Building project");
            dotnetBuild.run(true, true);
        }

        dir.pushd(dotnetPath.cliDir());

        const { cmd, args } = this.cmd(cliArgs);

        echo.success(`Full command:` + this.cmd(cliArgs).toString());
        const { status } = child_process.spawnSync(cmd, args, {
            stdio: "inherit",
            shell: true,
        });

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
