import { Constants } from "./constants";
import { DotnetPath } from "./dotnet-path";
import { Echo } from "./echo";
import { Formatters } from "./formatters";
import { Prompt } from "./prompt";
import shell, { ShellArray } from "shelljs";
import { OptionStringBuilder } from "../utilities/option-string-builder";
import { CollectionUtils } from "andculturecode-javascript-core";

interface NugetUpgrade {
    matchingProjects: string[];
    packageName: string;
    packageVersion: string;
    description: () => string;
    findCsprojFiles: () => ShellArray;
    getCsprojFilesContainingPackage: (csprojFiles: string[]) => string[];
    getOptions: () => OptionStringBuilder;
    promptForConfirmation: () => Promise<void>;
    promptForPackageName: () => Promise<string>;
    promptForPackageVersion: () => Promise<string>;
    validatePackageVersion: (packageVersion?: string) => string;
    replacePackageVersion: () => number;
    validatePackageName: (packageName?: string) => string;
    run: () => Promise<void>;
}

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const NugetUpgrade: NugetUpgrade = {
    matchingProjects: [],
    packageName: "",
    packageVersion: "",
    description() {
        return "Prompts the user to specify a NuGet package to upgrade for all projects in a solution.";
    },
    findCsprojFiles() {
        const solutionDir = DotnetPath.solutionDir();

        Echo.message("Looking for csproj files under the current directory...");

        const findResult = shell.find(`${solutionDir}/**/*.csproj`);
        if (findResult.code !== 0) {
            Echo.error(Constants.ERROR_READING_CSPROJ_FILES);
            shell.exit(findResult.code);
        }

        return findResult;
    },
    getCsprojFilesContainingPackage(csprojFiles: string[]) {
        Echo.message(`Looking for packages matching '${this.packageName}'...`);

        const grepResult = shell.grep("-l", this.packageName, csprojFiles);
        if (grepResult.code !== 0) {
            Echo.error(Constants.ERROR_READING_CSPROJ_FILES);
            shell.exit(grepResult.code);
        }

        const matchingProjects = grepResult.stdout
            .split("\n")
            .filter((result: string) => result.trim() !== "");
        if (CollectionUtils.isEmpty(matchingProjects)) {
            Echo.message(
                `No projects found with package '${this.packageName}'. Exiting.`
            );
            shell.exit(1);
        }

        return matchingProjects;
    },
    getOptions(): OptionStringBuilder {
        return new OptionStringBuilder("upgrade", "u");
    },
    async promptForConfirmation() {
        Echo.message(
            `${Formatters.red(
                this.matchingProjects.length.toString()
            )} projects found with package '${this.packageName}'.`
        );
        await Prompt.confirmOrExit("Continue?");
        this.replacePackageVersion();
    },
    async promptForPackageName() {
        const packageName = await Prompt.questionAsync(
            "Please enter a package to upgade: "
        );
        return this.validatePackageName(packageName);
    },
    async promptForPackageVersion() {
        const packageVersion = await Prompt.questionAsync(
            `Please enter a version to upgrade '${this.packageName}' to: `
        );
        return this.validatePackageVersion(packageVersion);
    },
    replacePackageVersion() {
        const sedResult = shell.sed(
            "-i",
            `(<PackageReference[ ]*Include[ ]*=[ ]*\"${this.packageName}\"[ ]*Version[ ]*=[ ]*\")([0-9]+.[0-9]+.[0-9]+)`,
            `$1${this.packageVersion}`,
            this.matchingProjects
        );
        if (sedResult.code !== 0) {
            Echo.error(
                `There was an error updating csproj files: ${sedResult}`
            );
            shell.exit(sedResult.code);
        }

        Echo.success(
            `Successfully updated '${this.packageName}' to version ${this.packageVersion}. Please check your git status before committing.`
        );
        return 0;
    },
    async run() {
        // Ensure we are in a directory that has a dotnet solution.
        DotnetPath.solutionPathOrExit();

        // Ask for the package name & version to upgrade
        this.packageName = await this.promptForPackageName();
        this.packageVersion = await this.promptForPackageVersion();

        // Find all of the csproj files and then narrow down the results to those that actually
        // require the package.
        const csprojFiles = this.findCsprojFiles();
        this.matchingProjects = this.getCsprojFilesContainingPackage(
            csprojFiles
        );

        // Finally, confirm the operation from the user to replace the package in those files
        await this.promptForConfirmation();
    },
    validatePackageName(packageName?: string): string {
        if (packageName == null || packageName.trim() === "") {
            Echo.error("Please enter a valid package name.");
            shell.exit(1);
        }

        return packageName!.trim();
    },
    validatePackageVersion(packageVersion?: string): string {
        if (
            packageVersion == null ||
            !packageVersion.match(Constants.VERSION_REGEX_PATTERN)
        ) {
            Echo.error(Constants.ERROR_INVALID_VERSION_STRING);
            shell.exit(1);
        }

        return packageVersion!;
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { NugetUpgrade };

// #endregion Exports
