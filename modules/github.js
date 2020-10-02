// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const { createNetrcAuth } = require("octokit-auth-netrc");
const echo = require("./echo");
const fs = require("fs");
const git = require("./git");
const js = require("./js");
const { Octokit } = require("@octokit/rest");
const os = require("os");
const upath = require("upath");
const userPrompt = require("./user-prompt");
const { StringUtils } = require("andculturecode-javascript-core");
const { fork } = require("child_process");
const { sleep } = require("./js");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const API_DOMAIN = "api.github.com";

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Private Variables
// -----------------------------------------------------------------------------------------

let _currentUser = null;
let _prompt = null;
let _token = null;

// #endregion Private Variables

// -----------------------------------------------------------------------------------------
// #region Public Members
// -----------------------------------------------------------------------------------------

const github = {
    // -----------------------------------------------------------------------------------------
    // #region Public Properties
    // -----------------------------------------------------------------------------------------

    andcultureOrg: "AndcultureCode",
    apiRepositoriesRouteParam: "repos",
    apiRootUrl: `https://${API_DOMAIN}`,
    configAuthConfigPath: upath.join(os.homedir(), ".netrc"), // Path to octokit-auth-netrc configuration
    configAuthDocsUrl:
        "https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token",
    configAuthTokenUrl: "https://github.com/settings/tokens/new",

    // #endregion Public Properties

    // -----------------------------------------------------------------------------------------
    // #region Public Methods
    // -----------------------------------------------------------------------------------------

    /**
     * Sets login token for github api
     * @param {string} token github personal access token
     */
    configureToken(token) {
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
        return `Helpful github operations used at andculture`;
    },

    /**
     * Retrieves a repository
     * @param {string} owner user or organization name owning the repo
     * @param {string} repoName short name of repository (excluding user/organization)
     */
    async getRepo(owner, repoName) {
        try {
            const response = await _client().repos.get({
                owner: owner,
                repo: repoName,
            });
            _throwIfApiError(response);

            return response.data;
        } catch (e) {
            echo.error(
                `Error retrieving repository for ${owner}/${repoName} - ${e}`
            );
            return null;
        }
    },

    /**
     * Forks a given repository for the current authenticated user
     *
     * While the github API asychronously forks the repo, our wrapper tries its best to wait for it
     * @param {string} ownerName User or organization that owns the repo being forked
     * @param {string} repoName The 'short' name of the repo (excludes the owner/user/organization)
     */
    async fork(ownerName, repoName) {
        if (!(await _verifyTokenFor("fork"))) {
            return null;
        }

        // Initiate creation of fork with Github
        let fork = null;
        try {
            const response = await _client().repos.createFork({
                owner: ownerName,
                repo: repoName,
            });
            _throwIfApiError(response);
            fork = response.data;
        } catch (e) {
            echo.error(e);
            return false;
        }

        // Poll github to see when it has completed (waits maximum of 5 minutes)
        echo.message(
            `Forking '${fork.name}'. Can take up to 5 minutes. Please wait...`
        );

        const isForkCreated = async (elapsed) => {
            echo.message(` - Looking for fork (${elapsed / 1000}s)...`);

            if ((await this.getRepo(fork.owner.login, fork.name)) == null) {
                return false;
            }

            echo.success(` - Fork of '${fork.name}' created successfully`);

            return true;
        };

        await js.waitFor(isForkCreated, 10000, 60000, function timeout() {
            echo.error(
                "Fork creation timed out, please contact github support"
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
            echo.error(e);
        }

        return _currentUser;
    },

    /**
     * Retrieves github auth token
     */
    async getToken() {
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
     * Requests user's github personal access token
     */
    async promptForToken() {
        echo.headerError("Github authentication is not currently configured");
        echo.message(`See instructions: ${this.configAuthDocsUrl}`);

        git.openWebBrowser(this.configAuthTokenUrl);

        _prompt = userPrompt.getPrompt();

        return await _prompt.questionAsync(
            "Please enter personal access token (with repo permissions): "
        );
    },

    /**
     * Lists all AndcultureCode repositories for the given username
     *
     * @param {string} username optional username - if not supplied, retrieves from AndcultureCode organization account
     * @param {function} filter optional filter function to perform on result set
     */
    async repositories(username, filter) {
        if (username == null) {
            return null;
        }

        try {
            return await _list(
                _client().repos.listForUser,
                { username },
                filter
            );
        } catch (error) {
            echo.error(
                `There was an error listing repositories by user ${username}: ${error}`
            );
            return null;
        }
    },

    /**
     * Lists all andculture organization repositories
     * @param {string} username optional username of user account. if null, returns master andculture organization repositories
     */
    async repositoriesByAndculture(username) {
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
    async repositoriesByOrganization(org, filter) {
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
            echo.error(
                `There was an error listing repositories by organization ${org}: ${error}`
            );
            return null;
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
        options.auth = _token;
    }

    return new Octokit(options);
};

const _filterReposByAndcultureOrg = (repos) =>
    repos.filter((r) => r.name.startsWith(github.andcultureOrg));

const _getConfigContents = (token) => `
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
const _list = async (command, options, filter) => {
    options.per_page = 100; // github api max

    let results = [];

    await _client()
        .paginate(command, options)
        .then((response) => {
            results = results.concat(response);
            return response;
        });

    if (filter != null) {
        results = filter(results);
    }

    return results;
};

/**
 * Throws an error if provided github api response isn't successful
 * @param {OctokitResponse} response API response object
 * @param {boolean} expectData In addition to a successful response, we expect data on the result
 * @param {string} actionText text explaining what authentication required action is being attempted
 */
const _throwIfApiError = (response, expectData, actionText) => {
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
 * Attempts to retrieve authentication token if it isn't configured
 * @param {string} actionText text explaining what authentication required action is being attempted
 */
const _verifyTokenFor = async (actionText) => {
    const token = await github.getToken();

    if (StringUtils.hasValue(token)) {
        return true;
    }

    echo.error(`Failed to ${actionText} - authentication is not configured`);

    return null;
};

//#endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = github;

// #endregion Exports
