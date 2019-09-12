#!/usr/bin/env node

/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const dotnetPath    = require("./_modules/dotnet-path");
const dotnetPublish = require("./_modules/dotnet-publish");
const echo          = require("./_modules/echo");
const fs            = require("fs");
const JSZip         = require("jszip");
const path          = require("path");
const program       = require("commander");
const shell         = require("shelljs");
const upath         = require ("upath");


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
    },
    description() {
        return `Runs dotnet publish on ${dotnetPath.solutionPath()} solution and deploys to configured AWS Elastic Beanstalk environment`;
    },
    run() {
        // Check system requirements
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

            echo.success(" - Successfully installe AWS EB CLI");
        }

        // Publish dotnet if enabled
        if (program.dotnet) {
            const releasePath = upath.toUnix(path.join(shell.pwd().toString(), dotnetPath.solutionDir(), "release"))
            dotnetPublish.run(releasePath);
        }

        // Create inner release zip
        const innerReleaseZipFile = dotnetPath.solutionDir() + "/release.zip";
        if (fs.existsSync(innerReleaseZipFile)) {
            shell.rm("-f", innerReleaseZipFile);
        }
        this.zip([dotnetPath.solutionDir() + "/release"], null, innerReleaseZipFile);

        // Create outer bundle release zip
        const awsBundleManifestFile = dotnetPath.solutionDir() + "/aws-windows-deployment-manifest.json";
        const outerReleaseZipFile = dotnetPath.solutionDir() + "/release-bundle.zip";
        if (fs.existsSync(outerReleaseZipFile)) {
            shell.rm("-f", outerReleaseZipFile);
        }
        this.zip(null, [innerReleaseZipFile, awsBundleManifestFile], outerReleaseZipFile);

        // Call EB deploy
    },
    zip(inputDirectories, inputFiles, outputPath) {
        if (inputDirectories === undefined || inputDirectories === null) {
            inputDirectories = [];
        }

        if (inputFiles === undefined || inputFiles === null) {
            inputFiles = [];
        }

        const zip = new JSZip();
        zip.generateNodeStream({ type:'nodebuffer', streamFiles:true })
           .pipe(fs.createWriteStream(outputPath))
           .on("finish", () => {
               echo.message("zip created");
           });



        // var output  = fs.createWriteStream(outputPath);
        // var archive = archiver("zip");

        // output.on('close', function() {
        //     echo.success(archive.pointer() + ' total bytes');
        //     echo.success('archiver has been finalized and the output file descriptor has closed.');
        // });

        // archive.on('warning', function(err) {
        //     if (err.code === 'ENOENT') {
        //         // log warning
        //     } else {
        //         // throw error
        //         throw err;
        //     }
        // });

        // // good practice to catch this error explicitly
        // archive.on('error', function(err) {
        //     throw err;
        // });

        // archive.pipe(output);

        // // add directories
        // inputDirectories.forEach((inputDirectory) => {
        //     echo.message("intput dir: " + inputDirectory);
        //     archive.directory(inputDirectory, false);
        // });

        // // add files
        // inputFiles.forEach((inputFile) => {
        //     echo.message(inputFile);
        //     archive.file(inputFile);//, { name: inputFileinputFile.replace("dotnet/", "") });
        // });

        // archive.finalize();
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
