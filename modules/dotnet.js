// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const child_process = require("child_process");
const commandStringFactory = require("../utilities/command-string-factory");
const dir = require("./dir");
const dotnetClean = require("./dotnet-clean");
const dotnetPath = require("./dotnet-path");
const dotnetRestore = require("./dotnet-restore");
const echo = require("./echo");
const optionStringFactory = require("../utilities/option-string-factory");
const shell = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const RUN_OPTION = optionStringFactory.build("run", "r");
const WATCH_OPTION = optionStringFactory.build("watch", "w");
const DOTNET_OPTIONS = {
    RUN: RUN_OPTION,
    WATCH: WATCH_OPTION,
};

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

let _clean = false;
let _option = DOTNET_OPTIONS.RUN;
let _restore = false;

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const dotnet = {
    cmd(option = DOTNET_OPTIONS.RUN) {
        const runString = option === DOTNET_OPTIONS.WATCH ? "watch run" : "run";
        return commandStringFactory.build("dotnet", runString, "--no-restore");
    },
    description(option = DOTNET_OPTIONS.RUN) {
        const webProjectFilePath =
            dotnetPath.webProjectFilePath() || "<web project path>";
        return `Runs the dotnet project (via ${this.cmd(
            option
        )}) for ${webProjectFilePath}`;
    },
    getOptions() {
        return DOTNET_OPTIONS;
    },
    run() {
        // Verify that the solution path exists or exit early.
        dotnetPath.solutionPathOrExit();

        if (_clean) {
            dotnetClean.run();
        }

        if (_restore) {
            dotnetRestore.run();
        }

        dir.pushd(dotnetPath.webProjectFileDir());

        // Since the spawnSync function takes the base command and all arguments separately, we cannot
        // leverage the base dotnet command string here. We'll build out the arg list in an array.
        const { cmd, args } = this.cmd(_option);

        echo.message(`Running dotnet (via ${this.cmd(_option)})...`);
        const { status } = child_process.spawnSync(cmd, args, {
            stdio: "inherit",
            shell: true,
        });

        if (status !== 0) {
            echo.error(`Exited with error: ${status}`);
            shell.exit(status);
        }

        dir.popd();
    },
    setClean(clean = false) {
        if (clean != null) {
            _clean = clean;
        }
        return this;
    },
    setOption(option = DOTNET_OPTIONS.RUN) {
        if (option != null) {
            _option = option;
        }
        return this;
    },
    setRestore(restore = false) {
        if (restore != null) {
            _restore = restore;
        }
        return this;
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = dotnet;

// #endregion Exports
