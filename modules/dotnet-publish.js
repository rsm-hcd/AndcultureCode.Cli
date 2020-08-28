// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const { StringUtils } = require("andculturecode-javascript-core");
const commandStringFactory = require("../utilities/command-string-factory");
const dir = require("./dir");
const dotnetPath = require("./dotnet-path");
const echo = require("./echo");
const optionStringFactory = require("../utilities/option-string-factory");
const shell = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const dotnetPublish = {
    cmd(outputDirectory) {
        if (StringUtils.isEmpty(outputDirectory)) {
            return commandStringFactory.build("dotnet", "publish");
        }

        return commandStringFactory.build(
            "dotnet",
            "publish",
            "-o",
            `"${outputDirectory}"`
        );
    },
    description() {
        return `Publishes the dotnet solution from the root of the project (via ${this.cmd()})`;
    },
    getOptions() {
        return optionStringFactory.build("publish", "p");
    },
    /**
     * Runs a publish of the dotnet solution to the local file system
     * @param {string} absoluteOutputDir Optional absolute path of release output directory. If not provided,
     * defaults to dotnet solution's 'release' directory
     */
    run(absoluteOutputDir) {
        if (absoluteOutputDir === undefined || absoluteOutputDir === null) {
            absoluteOutputDir = dotnetPath.releaseDir();
        }

        echo.message(`Cleaning release directory '${absoluteOutputDir}'...`);
        shell.rm("-rf", absoluteOutputDir);
        echo.success(" - Successfully cleaned released directory");
        echo.newLine();

        dir.pushd(dotnetPath.solutionDir());
        echo.message(
            `Publishing dotnet solution (via ${this.cmd(absoluteOutputDir)})...`
        );

        if (shell.exec(this.cmd(absoluteOutputDir)).code !== 0) {
            echo.error("Failed to publish dotnet project");
            shell.exit(1);
        }

        echo.success(" - Dotnet solution published");
        dir.popd();
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = dotnetPublish;

// #endregion Exports
