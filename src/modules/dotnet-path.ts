import { Echo } from "./echo";
import { File } from "./file";
import upath from "upath";
import shell from "shelljs";

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

/**
 * Represents the directory where a Presentation.Cli dll would live after a `dotnet build`
 */
const cliFilePath: string = "Presentation/Cli/bin/Debug/**/*Cli.dll";

/**
 * Wild-card searches used when finding the infrastructure/data dotnet core application project file. Ordered by most to least performant
 */
const dataProjectFilePaths: string[] = [
    "*.csproj",
    "dotnet/*/Infrastructure/Data.SqlServer/Data.SqlServer.csproj",
    "dotnet/*/Infrastructure/Data.*/Data.*.csproj",
    "**/Data*.csproj",
    "**/*.csproj",
];

/**
 * Represents the 'release' directory for a `dotnet build`
 */
const releaseDirectory: string = "release";

/**
 * Wild-card searches used when finding the solution file. Ordered by most to least performant
 */
const solutionFilePaths: string[] = [
    "*.sln",
    "dotnet/*.sln",
    "dotnet/*/*.sln",
    "**/*.sln",
];

/**
 * Wild-card searches used when finding the web dotnet core application project file. Ordered by most to least performant
 */
const webProjectFilePaths: string[] = [
    "*.csproj",
    "dotnet/*/Presentation/Web/Web.csproj",
    "**/*Web.csproj",
    "**/*.csproj",
];

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

let cachedCliPath: string;
let cachedDataProjectPath: string;
let cachedSolutionPath: string;
let cachedWebProjectFilePath: string;

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const DotnetPath = {
    CLI_FILE_PATH: cliFilePath,
    RELEASE_DIRECTORY: releaseDirectory,
    /**
     * Retrieves the dotnet cli's assembly directory path
     */
    cliDir(): string | undefined {
        const cliPath = this.cliPath();
        if (cliPath == null) {
            return undefined;
        }

        return upath.dirname(cliPath);
    },

    /**
     * Retrieves the dotnet cli's assembly path
     */
    cliPath(): string | undefined {
        if (cachedCliPath != null) {
            return cachedCliPath;
        }

        const solutionDir = this.solutionDir();
        if (solutionDir == null) {
            return undefined;
        }

        const cliFilePath = upath.join(solutionDir, this.CLI_FILE_PATH);
        cachedCliPath = File.first(cliFilePath);

        return cachedCliPath;
    },

    /**
     * Retrieves the dotnet data project file path (memoized)
     */
    dataProjectFilePath(): string | undefined {
        if (cachedDataProjectPath != null) {
            return cachedDataProjectPath;
        }

        for (var filePath of dataProjectFilePaths) {
            cachedDataProjectPath = File.first(filePath);
            if (cachedDataProjectPath != null) {
                return cachedDataProjectPath;
            }
        }

        return undefined;
    },

    /**
     * Retrieves the dotnet data project file path  or exits if it isn't found (memoized)
     */
    dataProjectFilePathOrExit(): string | never {
        const dataProjectPath = this.dataProjectFilePath();
        if (dataProjectPath != null) {
            return dataProjectPath;
        }

        Echo.error("Unable to find dotnet data project file");
        shell.exit(1);
    },

    /**
     * Retrieves the dotnet solution's release directory path (absolute path)
     */
    releaseDir(): string | undefined {
        const solutionDir = this.solutionDir();
        if (solutionDir == null) {
            return undefined;
        }

        return upath.join(
            shell.pwd().toString(),
            solutionDir,
            this.RELEASE_DIRECTORY
        );
    },

    /**
     * Retrieves the dotnet solution's folder path
     */
    solutionDir(): string | undefined {
        const solutionPath = this.solutionPath();
        if (solutionPath == null) {
            return undefined;
        }

        return upath.dirname(solutionPath);
    },

    /**
     * Retrieves the dotnet solution file path (memoized)
     */
    solutionPath(): string | undefined {
        if (cachedSolutionPath != null) {
            return cachedSolutionPath;
        }

        for (var filePath of solutionFilePaths) {
            cachedSolutionPath = File.first(filePath);
            if (cachedSolutionPath != null) {
                return cachedSolutionPath;
            }
        }

        return undefined;
    },

    /**
     * Retrieves the dotnet solution file path or exits if it isn't found (memoized)
     */
    solutionPathOrExit(): string | never {
        const solutionPath = this.solutionPath();
        if (solutionPath != null) {
            return solutionPath;
        }

        Echo.error("Unable to find dotnet solution file");
        shell.exit(1);
    },

    /**
     * Verifies that the `dotnet` executable is installed and returns its path. If `dotnet` cannot
     * be found within the current `PATH`, it returns undefined.
     *
     */
    verify(): string | undefined {
        const dotnetExecutablePath = shell.which("dotnet");
        if (dotnetExecutablePath == null) {
            return undefined;
        }

        return dotnetExecutablePath;
    },

    /**
     * Verifies that the `dotnet` executable is installed or exits if it cannot be found within
     * the current `PATH`
     *
     */
    verifyOrExit(): string | never {
        const dotnetExecutablePath = this.verify();
        if (dotnetExecutablePath != null) {
            return dotnetExecutablePath;
        }

        Echo.error(
            "Unable to locate dotnet executable. Check your environment path."
        );
        shell.exit(1);
    },

    /**
     * Retrieves the dotnet web project's folder path
     */
    webProjectFileDir(): string | undefined {
        const webProjectFilePath = this.webProjectFilePath();
        if (webProjectFilePath == null) {
            return undefined;
        }

        return upath.dirname(webProjectFilePath);
    },

    /**
     * Retrieves the dotnet web project file path (memoized)
     */
    webProjectFilePath(): string | undefined {
        if (cachedWebProjectFilePath != null) {
            return cachedWebProjectFilePath;
        }

        for (var filePath of webProjectFilePaths) {
            cachedWebProjectFilePath = File.first(filePath);
            if (cachedWebProjectFilePath != null) {
                return cachedWebProjectFilePath;
            }
        }

        return undefined;
    },

    /**
     * Retrieves the dotnet web project file path or exits if it isn't found (memoized)
     */
    webProjectFilePathOrExit(): string | never {
        const webProjectFilePath = this.webProjectFilePath();
        if (webProjectFilePath != null) {
            return webProjectFilePath;
        }

        Echo.error("Unable to find dotnet web project file");
        shell.exit(1);
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { DotnetPath };

// #endregion Exports
