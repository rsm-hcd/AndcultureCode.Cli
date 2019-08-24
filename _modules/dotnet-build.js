#!/usr/bin/env node

/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const dir           = require("./dir");
const file          = require("./file");
const dotnetClean   = require("./dotnet-clean");
const dotnetPath    = require("./dotnet-path");
const dotnetRestore = require("./dotnet-restore");
const echo          = require("./echo");
const formatters    = require("./formatters");
const shell         = require("shelljs");
const variables     = require("./variables");


/**************************************************************************************************
 * Functions
 **************************************************************************************************/

const dotnetBuild = {
    cmd() {
        return `dotnet build ${dotnetPath.solutionPath()} --no-restore`;
    },
    description() {
        return `Builds the dotnet project (via ${this.cmd()})`;
    },
    run(clean, restore) {

        dotnetPath.solutionPathOrExit();

        if (clean) {
            dotnetClean.run();
        }

        if (restore) {
            dotnetRestore.run();
        }

        echo.message(`Building solution (via ${this.cmd()})...`);

        let output = shell.exec(this.cmd(), { silent: true });

        shell.echo(formatters.dotnet(output));
    },
};


/**************************************************************************************************
 * Exports
 **************************************************************************************************/

module.exports = dotnetBuild;