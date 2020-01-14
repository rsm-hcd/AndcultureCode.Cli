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

        const buildResult = shell.exec(this.cmd(), { silent: true });
        shell.echo(formatters.dotnet(buildResult));

        if (buildResult.code !== 0) {
            echo.error("Solution failed to build. See output for details.");
            shell.exit(buildResult.code);
        }

        return buildResult.code;
    },
};


/**************************************************************************************************
 * Exports
 **************************************************************************************************/

module.exports = dotnetBuild;