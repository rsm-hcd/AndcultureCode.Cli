#!/usr/bin/env node
require("./command-runner").run(async () => {
    /**************************************************************************************************
     * Imports
     **************************************************************************************************/

    const { spawnSync } = require("child_process");
    const commands      = require("./_modules/commands");
    const dir           = require("./_modules/dir");
    const dotnetBuild   = require("./_modules/dotnet-build");
    const dotnetClean   = require("./_modules/dotnet-clean");
    const dotnetCli     = require("./_modules/dotnet-cli");
    const dotnetPath    = require("./_modules/dotnet-path");
    const dotnetPublish = require("./_modules/dotnet-publish");
    const dotnetRestore = require("./_modules/dotnet-restore");
    const echo          = require("./_modules/echo");
    const program       = require("commander");
    const shell         = require("shelljs");

    /**************************************************************************************************
     * Commands
     **************************************************************************************************/

    // #region Dotnet commands

    const dotnet = {
        cmd(mode) {
            return {
                args: [mode, "--no-restore"],
                cmd:  "dotnet",
            }
        },
        description(mode) {
            const { cmd, args } = this.cmd(mode);
            return `Runs the dotnet project (via ${cmd} ${args.join(" ")}) for ${dotnetPath.webProjectFilePath()}`;
        },
        run(mode) {
            if (program.clean) {
                dotnetClean.run();
            }

            if (program.restore) {
                dotnetRestore.run();
            }

            dir.pushd(dotnetPath.webProjectFileDir());

            // Since the spawnSync function takes the base command and all arguments separately, we cannot
            // leverage the base dotnet command string here. We'll build out the arg list in an array.
            const { cmd, args } = this.cmd(mode);

            echo.message(`Running dotnet (via ${cmd} ${args.join(" ")})...`);
            const result = spawnSync(cmd, args, { stdio: "inherit", shell: true });

            if (result.status !== 0) {
                echo.error(`Exited with error: ${result.status}`);
                shell.exit(result.status);
            }

            dir.popd();
        },
    };

    const dotnetKill = {
        cmds: {
            kill: "kill --force",
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
        .option("-C, --cli",     dotnetCli.description())
        .option("-k, --kill",    dotnetKill.description())
        .option("-p, --publish", dotnetPublish.description())
        .option("-R, --restore", dotnetRestore.description())
        .option("-r, --run",     dotnet.description("run"))
        .option("-w, --watch",   dotnet.description("watch run"))
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

    if (program.build)   { dotnetBuild.run(program.clean, program.restore); }
    if (program.cli)     { dotnetCli.run(program.args.join(" "));           }
    if (program.kill)    { dotnetKill.run();                                }
    if (program.publish) { dotnetPublish.run();                             }
    if (program.run)     { dotnet.run("run");                               }
    if (program.watch)   { dotnet.run("watch run");                         }

    // If no options are passed in, performs a build
    if (process.argv.slice(2).length === 0) { dotnet.run("run"); }

    // #endregion Entrypoint / Command router
});