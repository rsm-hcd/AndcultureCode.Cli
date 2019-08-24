#!/usr/bin/env node

/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const commands      = require("./_modules/commands");
const dotnetBuild   = require("./_modules/dotnet-build");
const dotnetClean   = require("./_modules/dotnet-clean");
const dotnetRestore = require("./_modules/dotnet-restore");
const echo          = require("./_modules/echo");
const program       = require("commander");
const shell         = require("shelljs");


/**************************************************************************************************
 * Commands
 **************************************************************************************************/

// #region Dotnet commands

const dotnetKill = {
    cmds: {
        kill:                "kill --force",
        shutdownBuildServer: "dotnet build-server shutdown",
    },
    description() {
        return `Forcefully kills any running dotnet processes (see https://github.com/dotnet/cli/issues/1327)`;
    },
    run() {
        echo.message(`Stopping dotnet build servers via (${this.cmds.shutdownBuildServer})...`)
        shell.exec(this.cmds.shutdownBuildServer);
        echo.success("Finished shutting down build servers.");
        echo.message(`Force killing dotnet PIDs... via (${this.cmds.kill})`);
        const dotnetPids = shell
            .exec("ps aux", { silent: true })
            .grep("dotnet")
            .exec("awk '{print $1}'", { silent: true })
            .split("\n")
            .filter((e) => e.length > 0);

        if (dotnetPids.length === 0) {
            echo.message("No dotnet PIDs found!")
        }

        dotnetPids.map((pid) => {
            const killReturn = shell.exec(`${this.cmds.kill} ${pid}`).code;
            if (killReturn === 0) {
                echo.success(`Successfully force killed dotnet PID ${pid}`);
                return;
            }
            echo.error(`Could not kill dotnet PID ${pid}`)
        });
        echo.success("Finished force killing lingering dotnet processes.");
    },
}

// #endregion Dotnet commands


/**************************************************************************************************
 * Entrypoint / Command router
 **************************************************************************************************/

// #region Entrypoint / Command router

program
    .usage("option(s)")
    .description(
        `${commands.dotnet.description} Certain options can be chained together for specific behavior ` +
        "(--clean and --restore can be used in conjunction with --build)."
    )
    .option("-b, --build",   dotnetBuild.description())
    .option("-c, --clean",   dotnetClean.description())
    .option("-k, --kill",    dotnetKill.description())
    .option("-R, --restore", dotnetRestore.description())
    .parse(process.argv);


// Only run dotnet clean on its own if we aren't building, running, or watching in the same command
// Otherwise, those commands will run the clean.
if ((!program.build && !program.run && !program.watch) && program.clean) {
    dotnetClean.run();
}

// Only run dotnet restore on its own if we aren't building, running, or watching in the same command
// Otherwise, those commands will run the restore.
if ((!program.build && !program.run && !program.watch) && program.restore) {
    dotnetRestore.run();
}

if (program.build) { dotnetBuild.run(program.clean, program.restore); }
if (program.kill)  { dotnetKill.run();                                }

// If no options are passed in, performs a build
if (process.argv.slice(2).length === 0) { dotnetBuild.run();          }

// #endregion Entrypoint / Command router