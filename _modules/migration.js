#!/usr/bin/env node

const dir        = require("./dir");
const dotnetPath = require("./dotnet-path");
const echo       = require("./echo");
const shell      = require("shelljs");
const upath = require("upath");


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

// #region Variables

let _migrationName = null;
let _mode          = null;

// #endregion Variables

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
                echo.error(`Invalid mode specified. Available options are: `);
                Object.keys(MIGRATION_MODE).map((mode) => echo.message(mode.toString()));
                shell.exit(1);
                break;
        }
        return baseCmd + `${migrationName} --startup-project ${startupProjectDir} --verbose`;
    },
    descriptionCreate() {
        return "Create new entity framework migration";
    },
    descriptionDelete() {
        return "Delete most recent entity framework migration";
    },
    descriptionRun() {
        return "Run (or revert) entity framework migration";
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
        if ((_mode === MIGRATION_MODE.ADD || _mode === MIGRATION_MODE.RUN) && _migrationName == null) {
            echo.error("Migration name is required, and can only be one word.");
            shell.exit(1);
        }

        dotnetPath.webProjectFilePathOrExit();
        const webProjectFileDir = upath.join(shell.pwd(), dotnetPath.webProjectFileDir());

        console.log("webProjectFileDir", webProjectFileDir);
        let migrationCmd = this.cmd(_mode, _migrationName, webProjectFileDir);

        echo.message(`Running EF migration command... (via ${migrationCmd})`);

        dir.pushd(webProjectFileDir);

        const result = shell.exec(migrationCmd);

        if (result.code !== 0) {
            echo.error(`Error running migration command: ${result}`);
            shell.exit(1);
        }

        dir.popd();

        echo.success("Finished running migration command. Remember to double check that the migration looks right before committing.");
    },
}

// #endregion Migration commands

module.exports = migration;