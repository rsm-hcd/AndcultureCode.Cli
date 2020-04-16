#!/usr/bin/env node

/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const dir        = require("./dir");
const dotnetPath = require("./dotnet-path");
const echo       = require("./echo");
const shell      = require("shelljs");

/**************************************************************************************************
 * Functions
 **************************************************************************************************/

const dotnetRestore = {
    cmd: "dotnet restore",
    description() {
        return `Restore the dotnet solution from the root of the project (via ${this.cmd})`;
    },
    run() {
        dir.pushd(dotnetPath.solutionDir());
        echo.message(`Restoring nuget packages (via ${this.cmd})...`);
        shell.exec(this.cmd);
        echo.success("Dotnet solution restored")
        dir.popd();
    },
};

/**************************************************************************************************
 * Exports
 **************************************************************************************************/

module.exports = dotnetRestore;
