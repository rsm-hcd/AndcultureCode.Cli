#!/usr/bin/env node
require("./command-runner").run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Imports
    // -----------------------------------------------------------------------------------------

    const commands     = require("./_modules/commands");
    const constants    = require("./_modules/constants");
    const dotnetPath   = require("./_modules/dotnet-path");
    const echo         = require("./_modules/echo");
    const nugetUpgrade = require("./_modules/nuget-upgrade");
    const program      = require("commander");
    const shell        = require("shelljs");

    // #endregion Imports

    // -----------------------------------------------------------------------------------------
    // #region Variables
    // -----------------------------------------------------------------------------------------

    const nugetUrl = "https://api.nuget.org/v3/index.json";

    // #endregion Variables

    // -----------------------------------------------------------------------------------------
    // #region Functions
    // -----------------------------------------------------------------------------------------

    const nugetPublish = {
        cmds: {
            pack: "dotnet pack",
            publish: "dotnet nuget push"
        },
        description() {
            return "Publishes NuGet packages for dotnet core projects";
        },
        run() {
            const publishVersion = program.publish;

            if (!publishVersion.match(constants.VERSION_REGEX_PATTERN)) {
                echo.error(constants.ERROR_INVALID_VERSION_STRING);
                shell.exit(1);
                return;
            }

            echo.message(`Publishing version '${publishVersion}'...`);

            // Update version number in .csproj files
            shell.ls("**/*.csproj").forEach(function (file) {
                shell.sed("-i", "<Version>(.*)</Version>", `<Version>${publishVersion}</Version>`, file);
            });

            const solutionPath = dotnetPath.solutionPathOrExit();

            // Create new nupkg file
            if (shell.exec(`dotnet pack ${solutionPath}`).code !== 0) {
                echo.error("Failed to pack dotnet project");
                shell.exit(1);
            }

            // Push nupkg to nuget servers
            const errored    = [];
            const successful = [];
            shell.ls(`**/*.${publishVersion}.nupkg`).forEach(function (file) {

                if (shell.exec(`dotnet nuget push ${file} -s ${nugetUrl}`).code !== 0) {
                    errored.push(file);
                    echo.error(`[FAILED] Publishing nuget package: '${file}'`);
                    return;
                }

                echo.success(`[SUCCESS] Publishing nuget package: '${file}'`);
                successful.push(file);
            });

            // Error output
            if (errored.length > 0) {
                echo.error(`Failed to publish ${errored.length} nuget package(s): ${JSON.stringify(errored)}`);
                shell.exit(1);
            }

            echo.success(`Successfully published version ${publishVersion}`);
        },
    }

    // #endregion Functions

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option(s)")
        .description(commands.nuget.description)
        .option("-p, --publish <version>", nugetPublish.description())
        .option("-u, --upgrade", nugetUpgrade.description())
        .parse(process.argv);

    if (program.publish) { nugetPublish.run(); }
    if (program.upgrade) { await nugetUpgrade.run(); }

    // If no options are passed in, output help
    if (process.argv.slice(2).length === 0) { program.help(); }

    // #endregion Entrypoint
});
