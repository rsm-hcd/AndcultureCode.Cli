#!/usr/bin/env node

/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const commands      = require("./_modules/commands");
const dotnetPath    = require("./_modules/dotnet-path");
const echo          = require("./_modules/echo");
const formatters    = require("./_modules/formatters");
const program       = require("commander");
const readline      = require("readline");
const shell         = require("shelljs");


/**************************************************************************************************
 * Variables
 **************************************************************************************************/

const nugetUrl = "https://api.nuget.org/v3/index.json";

// Semver regex pattern for validating version number (see https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string)
const versionRegexPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

const ERROR_INVALID_VERSION_STRING = "Invalid package version string (see https://docs.microsoft.com/en-us/nuget/concepts/package-versioning)";
const ERROR_READING_CSPROJ_FILES   = "There was an error reading csproj files.";

/**************************************************************************************************
 * Helper functions
 **************************************************************************************************/

const _isNonEmptyString = (value) =>
    value !== undefined &&
    value !== null &&
    typeof value === "string" &&
    value.length > 1;

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
            echo.error(ERROR_INVALID_VERSION_STRING);
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

const nugetUpgrade = {
    description() {
        return "Upgrades a specified NuGet package for all projects in a solution.";
    },
    run() {
        const prompt = readline.createInterface({
            input:  process.stdin,
            output: process.stdout,
        });

        let packageName    = "";
        let packageVersion = "";

        echo.message("Please enter a package to upgade:");
        prompt.question("", (packageNameResponse) => {
            packageName = packageNameResponse;
            if (packageName.trim() === "") {
                echo.error("Please enter a valid package name.");
                shell.exit(-1);
            }

            echo.message(`Please enter a version to upgade '${packageName}' to:`);
            prompt.question("", (packageVersionResponse) => {
                if (!packageVersionResponse.match(versionRegexPattern)) {
                    echo.error(ERROR_INVALID_VERSION_STRING);
                    shell.exit(1);
                }

                packageVersion = packageVersionResponse;

                echo.message(`Looking for packages matching '${packageName}'...`);

                const lsResult = shell.ls("**/*.csproj");
                if (lsResult.code !== 0) {
                    echo.error(ERROR_READING_CSPROJ_FILES);
                    shell.exit(lsResult.code);
                }

                const csprojFiles = lsResult.stdout.split("\n").filter((file) => file.trim() !== "");
                if (csprojFiles.length === 0) {
                    echo.error("No csproj files could be found. Please check the directory you're in.");
                    shell.exit(-1);
                }

                const grepResult = shell.grep("-l", packageName, csprojFiles);
                if (grepResult.code !== 0) {
                    echo.error(ERROR_READING_CSPROJ_FILES);
                    shell.exit(grepResult.code);
                }

                const matchingProjects = grepResult.stdout.split("\n").filter((result) => result.trim() !== "");
                if (matchingProjects.length === 0) {
                    echo.message(`No projects found with package '${packageName}'. Exiting.`);
                    shell.exit(-1);
                }

                echo.message(`${formatters.red(matchingProjects.length)} projects found with package '${packageName}'.`);
                prompt.question(`Continue? ${formatters.yellow("(y/n)")}: `, (confirmationResponse) => {
                    if (!confirmationResponse.match(/([yY][eE][sS]|[yY])/)) {
                        shell.exit(0);
                    }

                    shell.exit(0);
                });
            });
        });

    }
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
    .option("-u, --upgrade [package]", nugetUpgrade.description())
    .parse(process.argv);

if (program.publish) { nugetPublish.run(); }
if (program.upgrade) { nugetUpgrade.run(); }

// If no options are passed in, output help
if (process.argv.slice(2).length === 0) { program.help(); }

// #endregion Entrypoint / Command router