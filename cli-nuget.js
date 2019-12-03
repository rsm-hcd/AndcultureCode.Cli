#!/usr/bin/env node

/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const commands      = require("./_modules/commands");
const dotnetPath    = require("./_modules/dotnet-path");
const echo          = require("./_modules/echo");
const formatters    = require("./_modules/formatters");
const program       = require("commander");
const shell         = require("shelljs");


/**************************************************************************************************
 * Variables
 **************************************************************************************************/

const nugetUrl = "https://api.nuget.org/v3/index.json";

// Semver regex pattern for validating version number (see https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string)
const versionRegexPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

const ERROR_INVALID_VERSION_STRING = "Invalid package version string (see https://docs.microsoft.com/en-us/nuget/concepts/package-versioning)";

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
        return
    },
    description: {
        upgrade: "Upgrades a specified NuGet package for all projects in a solution.",
        version: `${formatters.red("(Required with --upgrade)")} Specifies the version of the package to upgrade to.`
    },
    run() {
        const packageName    = program.upgrade;
        const packageVersion = program.version;

        if (!packageVersion.match(versionRegexPattern)) {
            echo.error(ERROR_INVALID_VERSION_STRING);
            shell.exit(1);
            return;
        }

        echo.message(`Upgrading package '${packageName}' to version ${packageVersion}...`);

        const grepResult       = shell.grep("-l", packageName, shell.ls("**/*.csproj"));
        const matchingProjects = grepResult.stdout.split("\n").filter((result) => result.trim() !== "");

        if (matchingProjects.length === 0) {
            echo.message(`No projects found with package '${packageName}'. Exiting.`);
            shell.exit(0);
        }

        echo.message(`${formatters.red(matchingProjects.length)} projects found with package '${packageName}'. Continue? (y/n)`);
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
    .option("-u, --upgrade <package>", nugetUpgrade.description.upgrade)
    .option("-v, --version <version>", nugetUpgrade.description.version)
    .parse(process.argv);

if (program.publish)                    { nugetPublish.run(); }
if (program.upgrade && program.version) { nugetUpgrade.run(); }

// User-friendly error checking to make sure upgrade & version flags are used together
if ((program.upgrade && !program.version) ||
    (!program.upgrade && program.version)) {
        echo.error("-u or --upgrade must be used in conjunction with -v or --version");
        program.help();
}

// If no options are passed in, output help
if (process.argv.slice(2).length === 0) { program.help(); }

// #endregion Entrypoint / Command router