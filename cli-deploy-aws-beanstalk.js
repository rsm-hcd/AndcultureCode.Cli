#!/usr/bin/env node

/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const dir           = require("./_modules/dir");
const dotnetPath    = require("./_modules/dotnet-path");
const dotnetPublish = require("./_modules/dotnet-publish");
const echo          = require("./_modules/echo");
const file          = require("./_modules/file");
const path          = require("path");
const program       = require("commander");
const shell         = require("shelljs");
const upath         = require ("upath");
const zip           = require("./_modules/zip");


/**************************************************************************************************
 * Variables
 **************************************************************************************************/

const pythonInstallerUrl = "https://www.python.org/ftp/python/3.7.4/python-3.7.4-amd64.exe";


/**************************************************************************************************
 * Commands
 **************************************************************************************************/

// #region Commands

const deployAwsBeanstalk = {
    cmds: {
        deploy: "eb deploy",
    },
    description() {
        return `Runs dotnet publish on ${dotnetPath.solutionPath()} solution and deploys to configured AWS Elastic Beanstalk environment`;
    },
    async run() {
        // Check system requirements
        this.validateOrExit();

        let projectDir = "";

        // Publish dotnet if enabled
        if (program.dotnet) {
            const releasePath = upath.toUnix(path.join(shell.pwd().toString(), dotnetPath.solutionDir(), "release"))
            dotnetPublish.run(releasePath);
            projectDir = `${dotnetPath.solutionDir()}/`;
        }

        // Create inner release zip
        const innerReleaseFilename = "release.zip";
        const innerReleaseDir      = `${projectDir}release`;
        const innerReleaseZipFile  = `${projectDir}${innerReleaseFilename}`;
        file.deleteIfExists(innerReleaseZipFile);
        await zip.create([innerReleaseDir], null, innerReleaseZipFile);

        // Create outer bundle release zip
        const awsBundleManifestFilename = "aws-windows-deployment-manifest.json"; // TODO: Refactor to intelligently locate aws manifest file (ie. don't assume windows)
        const awsBundleManifestFile     = `${projectDir}${awsBundleManifestFilename}`;
        const outerReleaseZipFile       = `${projectDir}release-bundle.zip`;
        file.deleteIfExists(outerReleaseZipFile);

        const inputFiles = [
            { source: innerReleaseZipFile,   destination: innerReleaseFilename      },
            { source: awsBundleManifestFile, destination: awsBundleManifestFilename },
        ];
        await zip.create(null, inputFiles, outerReleaseZipFile);

        // Call EB deploy
        echo.message("Deploying to AWS beanstalk. Check AWS console for realtime output. This could take a few minutes...");
        if (shell.exec(this.cmds.deploy).code !== 0) {
            echo.error(" - Failed to deploy to AWS beanstalk");
            shell.exit(1);
        }

        // Cleanup
        dir.deleteIfExists(innerReleaseDir);
        file.deleteIfExists(innerReleaseZipFile);
        file.deleteIfExists(outerReleaseZipFile);

        echo.newLine();
        echo.success("Application successfully deployed to AWS beanstalk!");
    },

    validateOrExit() {
        if (!shell.which("python")) {
            echo.error(`Python 3.7+ is required - ${pythonInstallerUrl}`);
            shell.exit(1);
        }

        if (!shell.which("pip")) {
            echo.error(`PIP is required - ${pythonInstallerUrl}`);
            shell.exit(1);
        }

        if (!shell.which("eb")) {
            echo.message("AWS EB CLI not found. Installing via PIP...");

            if (shell.exec("pip install awsebcli").code !== 0) {
                echo.error("Failed to install eb cli via pip");
                shell.exit(1);
            }

            echo.success(" - Successfully installed AWS EB CLI");
        }

        return true;
    },

};

// #endregion Commands


/**************************************************************************************************
 * Entrypoint / Command router
 **************************************************************************************************/

// #region Entrypoint / Command router

program
    .usage("option")
    .description(deployAwsBeanstalk.description())
    .option("--dotnet", "Deploy dotnet core application via beanstalk")
    .parse(process.argv);

// #endregion Entrypoint / Command router

deployAwsBeanstalk.run();
