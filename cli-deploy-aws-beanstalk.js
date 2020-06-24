#!/usr/bin/env node
require("./command-runner").run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Imports
    // -----------------------------------------------------------------------------------------

    const dir           = require("./_modules/dir");
    const dotnetPath    = require("./_modules/dotnet-path");
    const dotnetPublish = require("./_modules/dotnet-publish");
    const echo          = require("./_modules/echo");
    const file          = require("./_modules/file");
    const program       = require("commander");
    const shell         = require("shelljs");
    const zip           = require("./_modules/zip");

    // #endregion Imports

    // -----------------------------------------------------------------------------------------
    // #region Variables
    // -----------------------------------------------------------------------------------------

    const pythonInstallerUrl = "https://www.python.org/ftp/python/3.7.4/python-3.7.4-amd64.exe";
    let timeout              = `--timeout 20`; // Default AWSEBCLI command timeout in minutes
    let verbose              = "";

    // #endregion Variables

    // -----------------------------------------------------------------------------------------
    // #region Functions
    // -----------------------------------------------------------------------------------------

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

            // Handling incoming arguments
            if (program.timeout) {
                timeout = `--timeout ${program.timeout}`;
            }
            if (program.verbose) {
                verbose = "--verbose";
            }

            let projectDir = "";

            // Publish dotnet if enabled
            if (program.dotnet) {
                dotnetPublish.run();
                projectDir = `${dotnetPath.solutionDir()}/`;
            }

            // Create inner release zip
            const innerReleaseFilename = "release.zip";
            const innerReleaseDir      = `${projectDir}release`;
            const innerReleaseZipFile  = `${projectDir}${innerReleaseFilename}`;
            file.deleteIfExists(innerReleaseZipFile);
            await zip.create([{ source: innerReleaseDir, destination: "/" }], null, innerReleaseZipFile);

            // Create outer bundle release zip
            const awsBundleManifestFilename = "aws-windows-deployment-manifest.json"; // TODO: Refactor to intelligently locate aws manifest file (ie. don't assume windows)
            const awsBundleManifestFile     = `${projectDir}${awsBundleManifestFilename}`;
            const outerReleaseZipFile       = `${projectDir}release-bundle.zip`;
            file.deleteIfExists(outerReleaseZipFile);

            const inputDirectories           = [];
            const awsBundleExtensionsDirname = ".ebextensions";
            const awsBundleExtensionsDir     = `${projectDir}${awsBundleExtensionsDirname}`;
            if (shell.test("-e", awsBundleExtensionsDir)) {
                echo.message("Adding .ebextensions directory");
                inputDirectories.push({ source: awsBundleExtensionsDir, destination: awsBundleExtensionsDirname });
            }

            const inputFiles = [
                { source: innerReleaseZipFile,   destination: innerReleaseFilename      },
                { source: awsBundleManifestFile, destination: awsBundleManifestFilename },
            ];
            await zip.create(inputDirectories, inputFiles, outerReleaseZipFile);

            // Call EB deploy
            echo.message("Deploying to AWS beanstalk. Check AWS console for realtime output. This could take a few minutes...");
            if (shell.exec(this.cmds.deploy + ` ${timeout} ${verbose}`).code !== 0) {
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

                // Unfortunately we must lock down our awscli and awsebcli versions so they use compatible dependencies https://github.com/aws/aws-cli/issues/3550
                if (shell.exec("pip install awsebcli==3.14.4").code !== 0) {
                    echo.error("Failed to install eb cli via pip");
                    shell.exit(1);
                }

                echo.success(" - Successfully installed AWS EB CLI");
            }

            return true;
        },

    };

    // #endregion Functions

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option")
        .description(deployAwsBeanstalk.description())
        .option("--dotnet",            "Deploy dotnet core application via beanstalk")
        .option("--verbose",           "Stream events from AWS")
        .option("--timeout <timeout>", `Optional elastic beanstalk deploy timeout. Default is ${timeout} minutes. When exceeded, exits with error`)
        .parse(process.argv);

    await deployAwsBeanstalk.run();

    // #endregion Entrypoint
});
