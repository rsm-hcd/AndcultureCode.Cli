#!/usr/bin/env node

/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const commands      = require("./_modules/commands");
const dotnetPath    = require("./_modules/dotnet-path");
const echo          = require("./_modules/echo");
const program       = require("commander");
const shell         = require("shelljs");


/**************************************************************************************************
 * Variables
 **************************************************************************************************/

const nugetUrl = "https://api.nuget.org/v3/index.json";

// Semver regex pattern for validating version number (see https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string)
const versionRegexPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;


/**************************************************************************************************
 * Commands
 **************************************************************************************************/

// #region NuGet commands

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

        if (!publishVersion.match(versionRegexPattern)) {
            echo.error("Invalid publish version string (see https://docs.microsoft.com/en-us/nuget/concepts/package-versioning)");
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
        shell.ls(`**/*.${publishVersion}.nupkg`).forEach(function(file) {

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

// #endregion NuGet commands


/**************************************************************************************************
 * Entrypoint / Command router
 **************************************************************************************************/

// #region Entrypoint / Command router

program
    .usage("option(s)")
    .description(commands.nuget.description)
    .option("-p, --publish <version>", nugetPublish.description())
    .parse(process.argv);

if (program.publish) { nugetPublish.run(); }

// If no options are passed in, output help
if (process.argv.slice(2).length === 0) { program.help(); }

// #endregion Entrypoint / Command router