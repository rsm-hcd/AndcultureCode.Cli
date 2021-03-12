import { StringUtils } from "andculturecode-javascript-core";
import { Constants } from "./constants";
import { Echo } from "./echo";
import { Prompt } from "./prompt";
import upath from "upath";
import os from "os";
import { Js } from "./js";
import { Formatters } from "./formatters";
// @ts-expect-error
import { createNetrcAuth } from "octokit-auth-netrc";
import { Octokit } from "@octokit/rest";
import { OctokitResponse } from "@octokit/types";
import fs from "fs";
import { Git } from "./git";
import shell from "shelljs";
import { Repository } from "../interfaces/github/repository";
import { Issue } from "../interfaces/github/issue";
import { CreateIssueDto } from "../interfaces/github/create-issue-dto";
import { CloneIssueDestinationDto } from "../interfaces/github/clone-issue-destination-dto";
import { CloneIssueSourceDto } from "../interfaces/github/clone-issue-source-dto";

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const AND_CLI_REPO_LINK =
    "[`and-cli`](https://github.com/AndcultureCode/AndcultureCode.Cli)";
const API_DOMAIN = "api.github.com";
const CREATED_BY_AND_CLI_FOOTER = `\n\n---\n_Issue created via ${AND_CLI_REPO_LINK}_`;

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Private Variables
// -----------------------------------------------------------------------------------------

let _currentUser: any = null;
let _token: string;

// #endregion Private Variables

// -----------------------------------------------------------------------------------------
// #region Public Members
// -----------------------------------------------------------------------------------------

const Github = {
    // -----------------------------------------------------------------------------------------
    // #region Public Properties
    // -----------------------------------------------------------------------------------------

    andcultureOrg: Constants.ANDCULTURE_CODE,
    apiIssuesRouteParam: "issues",
    apiPullsRouteParam: "pulls",
    apiRepositoriesRouteParam: "repos",
    apiReviewsRouteParam: "reviews",
    apiRootUrl: `https://${API_DOMAIN}`,
    apiTopicsRouteParam: "topics",
    configAuthConfigPath: upath.join(os.homedir(), ".netrc"), // Path to octokit-auth-netrc configuration
    configAuthDocsUrl:
        "https://docs.Github.com/en/free-pro-team@latest/github/authenticating-to-Github/creating-a-personal-access-token",
    configAuthTokenUrl: "https://github.com/settings/tokens/new",

    // #endregion Public Properties

    // -----------------------------------------------------------------------------------------
    // #region Public Methods
    // -----------------------------------------------------------------------------------------

    /**
     * Creates an issue for the specified repository
     *
     * @param {CreateIssueDto} dto
     * @returns {(Promise<Issue | undefined>)}
     */
    async addIssueToRepository(
        dto: CreateIssueDto
    ): Promise<Issue | undefined> {
        if (!(await _verifyTokenFor("create issue"))) {
            return undefined;
        }

        // Append the footer to note this issue was created thru the cli
        if (!dto.body?.includes(AND_CLI_REPO_LINK)) {
            dto.body = `${dto.body}${CREATED_BY_AND_CLI_FOOTER}`;
        }

        try {
            const response = await _client().issues.create({
                ...dto,
            });

            _throwIfApiError(response);
            return response.data;
        } catch (e) {
            Echo.error(
                `Error creating issue '${dto.title}' for ${dto.repo} - ${e}`
            );
            return undefined;
        }
    },

    /**
     * Adds a topic to all AndcultureCode repositories
     *
     * @param {string} topic Topic to be added
     */
    async addTopicToAllRepositories(topic?: string) {
        if (StringUtils.isEmpty(topic)) {
            Echo.error("Topic name is required");
            return;
        }

        const andcultureRepos = await this.repositoriesByAndculture();
        if (andcultureRepos == null) {
            return;
        }
        const repoNames = andcultureRepos.map((e: Repository) => e.name);

        // Safe guard against accidental command runs
        await _promptUpdateAllRepos(
            `add the topic '${topic}'`,
            repoNames.length
        );

        await Js.asyncForEach(repoNames, async (repoName: string) => {
            await this.addTopicToRepository(
                topic,
                this.andcultureOrg,
                repoName
            );
        });
    },

    /**
     * Adds a topic to given repository
     *
     * @param {string} topic Topic to be added
     * @param {string} owner user or organization name owning the repo
     * @param {string} repoName short name of repository (excluding user/organization)
     */
    async addTopicToRepository(
        topic?: string,
        owner?: string,
        repoName?: string
    ) {
        if (!_validateTopicInputOrExit(topic, owner, repoName)) {
            return null;
        }

        const updateFunction = (existingTopics: string[]) => [
            ...existingTopics,
            topic,
        ];

        const updateResult = await _updateTopicsForRepo(
            updateFunction,
            owner,
            repoName
        );

        _outputUpdateTopicResult(repoName!, updateResult);
        return updateResult;
    },

    /**
     * Clones an existing issue to another repository
     *
     * @param {CloneIssueSourceDto} source
     * @param {CloneIssueDestinationDto} destination
     */
    async cloneIssueToRepository(
        source: CloneIssueSourceDto,
        destination: CloneIssueDestinationDto
    ): Promise<Issue | undefined> {
        const sourceIssue = (
            await this.getIssues(source.owner, source.repo)
        )?.find((issue: Issue) => issue.number === source.number);

        if (sourceIssue == null) {
            Echo.error(
                `Issue '${source.owner}/${source.repo}#${source.number}' not found.`
            );
            shell.exit(1);
            // Returning for the sake of testing
            return;
        }

        const dto: CreateIssueDto = {
            body: `${sourceIssue.body}${clonedIssueFooter(source)}`,
            labels: sourceIssue.labels?.map((e) => e.name),
            owner: destination.owner,
            repo: destination.repo,
            title: sourceIssue.title,
        };

        return await Github.addIssueToRepository(dto);
    },

    /**
     * Sets login token for Github api
     * @param {string} token Github personal access token
     */
    configureToken(token: string) {
        const contents = _getConfigContents(token);

        if (!fs.existsSync(this.configAuthConfigPath)) {
            fs.writeFileSync(this.configAuthConfigPath, contents, {
                flag: "w",
            });
            return;
        }

        fs.appendFileSync(this.configAuthConfigPath, contents);
    },

    description() {
        return `Helpful Github operations used at ${Constants.ANDCULTURE}`;
    },

    /**
     * Retrieves list of pull requests for a repository
     * @param {string} owner user or organization name owning the repo
     * @param {string} repoName name of repository
     * @param {string} state all, closed, open
     */
    async getPullRequests(owner?: string, repoName?: string, state?: string) {
        if (!_validateInputOrExit(owner, repoName)) {
            return null;
        }

        state = StringUtils.isEmpty(state) ? "all" : state;

        try {
            const response = await _client().pulls.list({
                owner: owner!,
                repo: repoName!,
                // TODO: Pull this 'PullRequestState' enum
                state: state as any,
            });
            _throwIfApiError(response);

            return response.data;
        } catch (e) {
            Echo.error(
                `Error retrieving pull requests for ${owner}/${repoName} - ${e}`
            );
            return null;
        }
    },

    /**
     * Retrieves list of reviews for a pull request
     * @param {string} owner user or organization name owning the repo
     * @param {string} repoName name of repository
     * @param {number} number pull request number
     */
    async getPullRequestReviews(
        owner?: string,
        repoName?: string,
        number?: number
    ) {
        if (!_validateInputOrExit(owner, repoName)) {
            return null;
        }

        if (number == null) {
            Echo.error("Pull request number is required");
            shell.exit(1);
        }

        try {
            const response = await _client().pulls.listReviews({
                owner: owner!,
                repo: repoName!,
                pull_number: number,
            });
            _throwIfApiError(response);

            return response.data;
        } catch (e) {
            Echo.error(
                `Error retrieving reviews for ${owner}/${repoName}/pulls/${number} - ${e}`
            );
        }
    },

    /**
     * Retrieves a repository
     * @param {string} owner user or organization name owning the repo
     * @param {string} repoName short name of repository (excluding user/organization)
     */
    async getRepo(owner: string, repoName: string) {
        try {
            const response = await _client().repos.get({
                owner: owner,
                repo: repoName,
            });
            _throwIfApiError(response);

            return response.data;
        } catch (e) {
            Echo.error(
                `Error retrieving repository for ${owner}/${repoName} - ${e}`
            );
            return null;
        }
    },

    /**
     * Returns a list of Issues for the given repository
     *
     * @param {string} owner
     * @param {string} repoName
     * @returns {(Promise<Issue[] | undefined>)}
     */
    async getIssues(
        owner: string,
        repoName: string
    ): Promise<Issue[] | undefined> {
        try {
            return await _list(_client().issues.listForRepo, {
                owner: owner,
                repo: repoName,
                filter: "all",
                sort: "created",
                direction: "desc",
            });
        } catch (e) {
            Echo.error(
                `Error retrieving issues for ${owner}/${repoName} - ${e}`
            );
            return undefined;
        }
    },

    /**
     * Forks a given repository for the current authenticated user
     *
     * While the Github API asychronously forks the repo, our wrapper tries its best to wait for it
     * @param {string} ownerName User or organization that owns the repo being forked
     * @param {string} repoName The 'short' name of the repo (excludes the owner/user/organization)
     */
    async fork(ownerName: string, repoName: string) {
        if (!(await _verifyTokenFor("fork"))) {
            return null;
        }

        // Initiate creation of fork with Github
        let fork: Repository;
        try {
            const response = await _client().repos.createFork({
                owner: ownerName,
                repo: repoName,
            });
            _throwIfApiError(response, false, "fork");
            fork = response.data;
        } catch (e) {
            Echo.error(e);
            return false;
        }

        // Poll Github to see when it has completed (waits maximum of 5 minutes)
        Echo.message(
            `Forking '${fork.name}'. Can take up to 5 minutes. Please wait...`
        );

        const isForkCreated = async (elapsed: number) => {
            Echo.message(` - Looking for fork (${elapsed / 1000}s)...`);

            if ((await this.getRepo(fork.owner.login, fork.name)) == null) {
                return false;
            }

            Echo.success(` - Fork of '${fork.name}' created successfully`);

            return true;
        };

        await Js.waitFor(isForkCreated, 10000, 60000, function timeout() {
            Echo.error(
                "Fork creation timed out, please contact Github support"
            );
        });

        return false; // never found it!
    },

    /**
     * Retrieves user information of the current authenticated user
     */
    async getCurrentUser() {
        if (_currentUser != null) {
            return _currentUser;
        }

        if (!(await _verifyTokenFor("get current user"))) {
            return null;
        }

        try {
            const response = await _client().users.getAuthenticated();
            _throwIfApiError(response, true, "get current user");
            _currentUser = response.data;
        } catch (e) {
            Echo.error(e);
        }

        return _currentUser;
    },

    /**
     * Retrieves Github auth token
     */
    async getToken(): Promise<string> {
        if (_token != null) {
            return _token;
        }

        if (!(await this.isTokenConfigured())) {
            const token = await this.promptForToken();
            this.configureToken(token);
        }

        _token = await _getTokenFromConfig();

        return _token;
    },

    async isTokenConfigured() {
        return (await _getTokenFromConfig()) != null;
    },

    /**
     * Requests user's Github personal access token
     */
    async promptForToken() {
        Echo.headerError("Github authentication is not currently configured");
        Echo.message(`See instructions: ${this.configAuthDocsUrl}`);

        Git.openWebBrowser(this.configAuthTokenUrl);

        return await Prompt.questionAsync(
            "Please enter personal access token (with repo permissions): "
        );
    },

    /**
     * Lists all AndcultureCode repositories for the given username
     *
     * @param {string} username optional username - if not supplied, retrieves from AndcultureCode organization account
     * @param {function} filter optional filter function to perform on result set
     */
    async repositories(
        username?: string,
        filter?: (repositories: Repository[]) => Repository[]
    ): Promise<Repository[] | undefined> {
        if (username == null) {
            return;
        }

        try {
            return await _list(
                _client().repos.listForUser,
                { username },
                filter
            );
        } catch (error) {
            Echo.error(
                `There was an error listing repositories by user ${username}: ${error}`
            );
            return;
        }
    },

    /**
     * Removes a topic from all AndcultureCode repositories
     *
     * @param {string} topic Topic to be removed
     */
    async removeTopicFromAllRepositories(topic?: string) {
        if (StringUtils.isEmpty(topic)) {
            Echo.error("Topic name is required");
            return;
        }

        const andcultureRepos = await this.repositoriesByAndculture();
        if (andcultureRepos == null) {
            return;
        }

        const repoNames = andcultureRepos.map((e: Repository) => e.name);

        // Safe guard against accidental command runs
        await _promptUpdateAllRepos(
            `remove the topic '${topic}'`,
            repoNames.length
        );

        await Js.asyncForEach(repoNames, async (repoName: string) => {
            await this.removeTopicFromRepository(
                topic,
                this.andcultureOrg,
                repoName
            );
        });
    },

    /**
     * Removes a topic from a given repository
     *
     * @param {string} topic Topic to be removed
     * @param {string} owner user or organization name owning the repo
     * @param {string} repoName short name of repository (excluding user/organization)
     */
    async removeTopicFromRepository(
        topic?: string,
        owner?: string,
        repoName?: string
    ) {
        if (!_validateTopicInputOrExit(topic, owner, repoName)) {
            return null;
        }

        const updateFunction = (existingTopics: string[]) =>
            existingTopics.filter(
                (existingTopic: string) => existingTopic !== topic
            );

        const updateResult = await _updateTopicsForRepo(
            updateFunction,
            owner,
            repoName
        );

        _outputUpdateTopicResult(repoName!, updateResult);
        return updateResult;
    },

    /**
     * Lists all andculture organization repositories
     * @param {string} username optional username of user account. if null, returns main andculture
     * organization repositories
     */
    async repositoriesByAndculture(
        username?: string
    ): Promise<Repository[] | undefined> {
        const fn =
            username == null
                ? this.repositoriesByOrganization
                : this.repositories;
        const name = username == null ? this.andcultureOrg : username;
        return await fn(name, _filterReposByAndcultureOrg);
    },

    /**
     * Lists all repositories for a given organization
     * @param {string} org name of organization. if null, set to andculture organization
     * @param {function} filter optional filter function to perform on result set
     */
    async repositoriesByOrganization(
        org?: string,
        filter?: (repos: Repository[]) => Repository[]
    ): Promise<Repository[] | undefined> {
        if (org == null) {
            org = this.andcultureOrg;
        }

        const options = {
            org,
            type: "public",
        };

        try {
            return await _list(_client().repos.listForOrg, options, filter);
        } catch (error) {
            Echo.error(
                `There was an error listing repositories by organization ${org}: ${error}`
            );
            return;
        }
    },

    /**
     * Returns the topics for a specific repository
     *
     * @param {string} ownerName User or organization that owns the repo
     * @param {string} repoName The 'short' name of the repo (excludes the owner/user/organization)
     * @returns {string[] | undefined} Array of topics related to the repository
     */
    async topicsForRepository(owner?: string, repoName?: string) {
        const actionText = "list topics";
        if (StringUtils.isEmpty(owner) || StringUtils.isEmpty(repoName)) {
            Echo.error(
                `Owner and repository name are required to ${actionText}.`
            );
            return;
        }

        try {
            const response = await _client().repos.getAllTopics({
                owner: owner!,
                repo: repoName!,
            });

            _throwIfApiError(response, true, actionText);

            return response.data.names;
        } catch (error) {
            Echo.error(
                `There was an error attempting to ${actionText} for repository ${repoName} by owner ${owner}: ${error}`
            );
            return;
        }
    },

    // #endregion Public Methods
};

// #endregion Public Members

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

const _client = () => {
    const options = {};

    if (StringUtils.hasValue(_token)) {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'auth' does not exist on type '{}'.
        options.auth = _token;
    }

    return new Octokit(options);
};

const clonedIssueFooter = (sourceIssue: CloneIssueSourceDto): string =>
    `\n\n---\n_Issue cloned from ${sourceIssue.owner}/${sourceIssue.repo}#${sourceIssue.number} via ${AND_CLI_REPO_LINK}_`;

const _filterReposByAndcultureOrg = (repos: Repository[]) =>
    repos.filter((r: Repository) => r.name.startsWith(Github.andcultureOrg));

const _getConfigContents = (token: string) => `
machine ${API_DOMAIN}
    login ${token}
`;

const _getTokenFromConfig = async () => {
    try {
        const auth = createNetrcAuth();
        const result = await auth();
        return result != null ? result.token : null;
    } catch (error) {
        return null;
    }
};

/**
 * Retrieves all records for a given list command, accounting for pagination
 * @param {object} command
 * @param {object} options
 * @param {(results: object[]) => object[]} filter optional filter function to perform on result set
 */
const _list = async <T>(
    command: any,
    options: any,
    filter?: (results: T[]) => T[]
) => {
    options.per_page = 100; // Github api max

    let results: T[] = [];

    await _client()
        .paginate(command, options)
        .then((response: T[]) => {
            results = results.concat(response);
            return response;
        });

    if (filter != null) {
        results = filter(results);
    }

    return results;
};

/**
 * Outputs information for a topic update operation
 *
 * @param {string} repoName short name of repository (excluding user/organization)
 * @param {string[] | undefined} result Result to concatenate topic names from
 */
const _outputUpdateTopicResult = (repoName: string, result?: string[]) => {
    // If nothing came back from the update, an error message should already have been displayed.
    if (result == null) {
        return;
    }

    Echo.success(`Updated topics for ${repoName}`);
    Echo.message(result.join(", "));
};

/**
 * Prompts the user to confirm an action affecting multiple repositories to prevent accidental changes
 *
 * @param {string} actionText Text representing the action to be performed on all repos
 * @param {number} repoCount Number of repos that will be affected by the change
 */
const _promptUpdateAllRepos = (actionText: string, repoCount: number) =>
    Prompt.confirmOrExit(
        `Are you sure you want to ${actionText} for ${Formatters.yellow(
            repoCount.toString()
        )} ${Github.andcultureOrg} repos?`
    );

/**
 * Throws an error if provided Github api response isn't successful
 * @param {OctokitResponse} response API response object
 * @param {boolean} expectData In addition to a successful response, we expect data on the result
 * @param {string} actionText text explaining what authentication required action is being attempted
 */
const _throwIfApiError = <T = any>(
    response: OctokitResponse<T>,
    expectData: boolean = false,
    actionText: string = "receive response"
) => {
    const data = response.data;
    const status = response.status;

    // HTTP OK (200), Created (201) or Accepted (202) are considered successful
    if (status >= 200 && status <= 202 && (!expectData || data != null)) {
        return;
    }

    throw new Error(
        `Failed to ${actionText} - Status: ${status}, Data: ${JSON.stringify(
            data
        )}`
    );
};

/**
 * Updates the set of topics for a given repository based on the given updater function.
 *
 * @param {(existingTopics: string[]) => string[]} updateFunc Manipulation function to be run on the
 * existing topic list for a repo.
 * @param {string} owner user or organization name owning the repo
 * @param {string} repoName short name of repository (excluding user/organization)
 */
const _updateTopicsForRepo = async (
    updateFunc: any,
    owner: any,
    repoName: any
) => {
    const actionText = "update topics";
    if (!(await _verifyTokenFor(actionText))) {
        return;
    }

    const existingTopics = await Github.topicsForRepository(owner, repoName);
    if (existingTopics == null) {
        return;
    }

    const updatedTopics = updateFunc(existingTopics);
    try {
        const response = await _client().repos.replaceAllTopics({
            owner: owner,
            repo: repoName,
            names: updatedTopics,
        });

        _throwIfApiError(response, true, actionText);

        return response.data.names;
    } catch (error) {
        Echo.error(`Failed to ${actionText} for repo ${repoName}: ${error}`);
        return;
    }
};

/**
 * Validates standard user input
 *
 * @param {string} owner user or organization name owning the repo
 * @param {string} repoName short name of repository (excluding user/organization)
 */
const _validateInputOrExit = (owner?: string, repoName?: string) => {
    if (StringUtils.hasValue(owner) && StringUtils.hasValue(repoName)) {
        return true;
    }

    Echo.error("Owner and repository name must be provided");
    shell.exit(1);
};

/**
 * Validates user input for updating topics
 *
 * @param {string} topic Topic to be updated
 * @param {string} owner user or organization name owning the repo
 * @param {string} repoName short name of repository (excluding user/organization)
 */
const _validateTopicInputOrExit = (
    topic?: string,
    owner?: string,
    repoName?: string
) => {
    if (_validateInputOrExit(owner, repoName) && StringUtils.hasValue(topic)) {
        return true;
    }

    Echo.error("Topic must be provided");
    shell.exit(1);
};

/**
 * Attempts to retrieve authentication token if it isn't configured
 * @param {string} actionText text explaining what authentication required action is being attempted
 */
const _verifyTokenFor = async (actionText: string) => {
    const token = await Github.getToken();

    if (StringUtils.hasValue(token)) {
        return true;
    }

    Echo.error(`Failed to ${actionText} - authentication is not configured`);

    return null;
};

// #endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { Github };

// #endregion Exports
