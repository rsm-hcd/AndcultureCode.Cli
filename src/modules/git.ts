import { Echo } from "./echo";
import fs from "fs";
import shell, { ExecOutputReturnValue } from "shelljs";
import { StringUtils } from "andculturecode-javascript-core";
import { Constants } from "./constants";
import { GitPushOptions } from "../interfaces/git-push-options";

// -----------------------------------------------------------------------------------------
// #region Public Functions
// -----------------------------------------------------------------------------------------

const Git = {
    /**
     * Stages provided 'pathspecs' for committing
     * @see https://git-scm.com/docs/git-add#Documentation/git-add.txt-ltpathspecgt82308203
     */
    add(...pathspecs: string[]): boolean {
        const command = `git add ${pathspecs.join(" ")}`;
        return _exec(command);
    },

    /**
     * Adds all tracked files (ie `git add -A`)
     * @see https://git-scm.com/docs/git-add#Documentation/git-add.txt--A
     */
    addAll(): boolean {
        return this.add("-A");
    },

    /**
     * Configures a new remote when run in root of git repository
     * @param {string} name local identifier for a new remote
     * @param {string} url absolute url corresponding to remote destination
     */
    addRemote(name: string, url: string) {
        if (!this.isRepositoryRoot()) {
            Echo.error(
                `Cannot add remote '${name}'. Current directory '${shell.pwd()} is not the root of a git repository.`
            );
            return false;
        }

        const command = `git remote add ${name} ${url}`;
        return _exec(command);
    },

    /**
     * Clone a git repository
     * @param {string} name Name of repository being cloned
     * @param {string} url Absolute HTTPS or SSH repository URL
     * @param {string} prefix Prefix for destination folder '{FOLDER_PREFIX}.{REPOSITORY_NAME}'
     */
    clone(name: string, url: string, prefix?: string) {
        if (StringUtils.isEmpty(name)) {
            return false;
        }

        if (StringUtils.isEmpty(url)) {
            return false;
        }

        const folder = this.getCloneDirectoryName(name, prefix);
        const cloneResult = shell.exec(`git clone ${url} ${folder}`, {
            silent: true,
        }) as ExecOutputReturnValue;
        if (cloneResult.code !== 0) {
            Echo.error(`Failed to clone '${name}' - ${cloneResult.stderr}`);
            return false;
        }

        return true;
    },

    /**
     * Record changes to the repository
     * @see https://git-scm.com/docs/git-commit
     */
    commit(message: string): boolean {
        if (StringUtils.isEmpty(message)) {
            Echo.error(`Invalid commit message provided: ${message}`);
            return false;
        }

        const command = `git commit -m "${message}"`;
        return _exec(command);
    },

    /**
     * Commits a version revision with a standard message
     */
    commitRev(version: string): boolean {
        if (!Constants.VERSION_REGEX_PATTERN.test(version)) {
            Echo.error(Constants.ERROR_INVALID_VERSION_STRING);
            return false;
        }

        return this.commit(`Rev'd to ${version}`);
    },

    /**
     * Constructs target folder name given a repo and optional prefix
     * @param {string} repoName short name of repository
     * @param {string} prefix optional prefix
     */
    getCloneDirectoryName(repoName: string, prefix?: string) {
        if (StringUtils.isEmpty(repoName)) {
            return "";
        }

        return StringUtils.hasValue(prefix)
            ? `${prefix}.${repoName}`
            : repoName;
    },

    /**
     * Checks if the repository is cloned for the supplied combination
     * @param {string} repoName short name of repository
     * @param {string} prefix optional prefix
     */
    isCloned(repoName: string, prefix?: string) {
        const folder = Git.getCloneDirectoryName(repoName, prefix);
        return fs.existsSync(folder);
    },

    /**
     * Verifies if we are in a git repo
     */
    isRepositoryRoot(): boolean {
        // not verifying integrity at this time
        // consider `git rev-parse --is-inside-work-tree at a future time
        return fs.existsSync(".git");
    },

    /**
     * Opens the supplied URL in the system's default browser
     * @param {string} url absolute url
     */
    openWebBrowser(url: string) {
        shell.exec(`git web--browse ${url}`);
    },

    /**
     * Pushes commits to the remote repository
     */
    push(options?: GitPushOptions): boolean {
        let command = "git push";
        if (options?.dryRun === true) {
            command = `${command} --dry-run`;
        }

        return _exec(command);
    },
};

// #endregion Public Functions

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

const _exec = (command: string): boolean => shell.exec(command).code === 0;

// #endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { Git };

// #endregion Exports
