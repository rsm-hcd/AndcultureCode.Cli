#!/usr/bin/env node

/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const dir        = require("./dir");
const dotnetPath = require("./dotnet-path");
const echo       = require("./echo");
const shell      = require("shelljs");
const variables  = require("./variables");


/**************************************************************************************************
 * Functions
 **************************************************************************************************/

const dotnetPublish = {
    cmd(outputDirectory) {
        if (outputDirectory === undefined || outputDirectory === null) {
            return "dotnet publish";
        }

        return `dotnet publish -o ${outputDirectory}`;
    },
    description() {
        return `Publishes the dotnet solution from the root of the project (via ${this.cmd()})`;
    },
    run(absoluteOutputDir) {

        echo.message(`Cleaning release directory '${absoluteOutputDir}'...`);
        shell.rm("-rf", absoluteOutputDir);
        echo.success(" - Successfully cleaned released directory");
        echo.newLine();

        dir.pushd(dotnetPath.solutionDir());
        echo.message(`Publishing dotnet solution (via ${this.cmd(absoluteOutputDir)})...`);

        if (shell.exec(this.cmd(absoluteOutputDir)).code !== 0) {
            echo.error("Failed to publish dotnet project");
            shell.exit(1);
        }

        echo.success("Dotnet solution published")
        dir.popd();
    },
};


/**************************************************************************************************
 * Exports
 **************************************************************************************************/

module.exports = dotnetPublish;