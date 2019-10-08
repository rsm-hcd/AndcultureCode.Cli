#!/usr/bin/env node

const dir        = require("./dir");
const dotnetPath = require("./dotnet-path");
const echo       = require("./echo");
const path       = require("path");
const shell      = require("shelljs");
const upath      = require("upath");

/**************************************************************************************************
 * Constants
 **************************************************************************************************/

// #region Constants

const MIGRATION_MODE = {
    ADD:    "ADD",
    DELETE: "DELETE",
    RUN:    "RUN",
};

const MIGRATION_COMMAND = {
    [MIGRATION_MODE.ADD]:    " migrations add ",
    [MIGRATION_MODE.DELETE]: " migrations remove ",
    [MIGRATION_MODE.RUN]:    " database update ",
};

// #endregion Constants

/**************************************************************************************************
 * Variables
 **************************************************************************************************/

// #region Variables

let _startupProjectDir = dotnetPath.webProjectFilePath();
let _migrationName     = null;
let _mode              = null;

// #endregion Variables

/**************************************************************************************************
 * Functions
 **************************************************************************************************/

// #region Functions

const migration = {
    cmd(mode, migrationName, startupProjectDir) {
        let baseCmd = "dotnet ef";
        switch(mode) {
            case MIGRATION_MODE.ADD:
            case MIGRATION_MODE.DELETE:
            case MIGRATION_MODE.RUN:
                baseCmd += MIGRATION_COMMAND[mode];
                break;
            default:
                echo.error(`Invalid mode specified. Available options are: ${Object.keys(MIGRATION_MODE)}`);
                shell.exit(1);
                break;
        }
        return baseCmd + `${migrationName} --startup-project ${startupProjectDir} --verbose`;
    },
    description(mode) {
        switch(mode) {
            case MIGRATION_MODE.ADD:
                return `Create new entity framework migration (via ${this.cmd(mode, "<migration name>", _startupProjectDir)})`;
            case MIGRATION_MODE.DELETE:
                return `Delete most recent entity framework migration (via ${this.cmd(mode, "", _startupProjectDir)})`
            case MIGRATION_MODE.RUN:
                return `Run (or revert) entity framework migration (via ${this.cmd(mode, "<migration name>", _startupProjectDir)})`
                break;
            default:
                echo.error(`Invalid mode specified. Available options are: ${Object.keys(MIGRATION_MODE)}`);
                shell.exit(1);
                break;
        }
    },
    migrationName(migrationName = null) {
        if (migrationName !== null && migrationName !== _migrationName) {
            _migrationName = migrationName;
        }
        return this;
    },
    mode(mode = null) {
        if (mode !== null && mode !== _mode) {
            _mode = mode;
        }
        return this;
    },
    modes() {
        return MIGRATION_MODE;
    },
    run() {
        if ((_mode === MIGRATION_MODE.ADD || _mode === MIGRATION_MODE.RUN) &&
            (_migrationName === null || _migrationName.length !== 1)) {
            echo.error("Migration name is required, and can only be one word.");
            shell.exit(1);
        }

        dotnetPath.webProjectFilePathOrExit();
        const webProjectFileDir = upath.join(shell.pwd(), dotnetPath.webProjectFileDir());

        const dataProjectFilePath = dotnetPath.dataProjectFilePathOrExit();
        const dataProjectDir      = path.dirname(dataProjectFilePath);

        const migrationCmd = this.cmd(_mode, _migrationName, webProjectFileDir);

        echo.message(`Running EF migration command... (via ${migrationCmd})`);

        dir.pushd(dataProjectDir);

        const result = shell.exec(migrationCmd);

        if (result.code !== 0) {
            echo.error(`Error running migration command: ${result}`);
            shell.exit(1);
        }

        dir.popd();

        echo.success("Finished running migration command. Remember to double check that the migration looks right before committing.");
    },
}

// #endregion Functions

/**************************************************************************************************
 * Exports
 **************************************************************************************************/

module.exports = migration;
