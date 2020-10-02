// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const { createNetrcAuth } = require("octokit-auth-netrc");
const echo = require("./echo");
const fs = require("fs");
const git = require("./git");
const { Octokit } = require("@octokit/rest");
const os = require("os");
const upath = require("upath");
const userPrompt = require("./user-prompt");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Public Members
// -----------------------------------------------------------------------------------------

const github = {
    // -----------------------------------------------------------------------------------------
    // #region Properties
    // -----------------------------------------------------------------------------------------

    _prompt: null,
    _token: null,
    andcultureOrg: "AndcultureCode",
    apiRepositoriesRouteParam: "repos",
    apiRootUrl: "https://api.github.com",
    configAuthConfigPath: upath.join(os.homedir(), ".netrc"), // Path to octokit-auth-netrc configuration
    configAuthDocsUrl:
        "https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token",
    configAuthTokenUrl: "https://github.com/settings/tokens/new",

    // #endregion Properties

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
     * Retrieves github auth token
     */
    async getToken() {
        if (this._token != null) {
            return this._token;
        }

        if (!(await this.isTokenConfigured())) {
            const token = await this.promptForToken();
            this.configureToken(token);
        }

        this._token = await _getTokenFromConfig();

        return this._token;
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

        this._prompt = userPrompt.getPrompt();

        return await this._prompt.questionAsync(
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
    return new Octokit(options);
};

const _filterReposByAndcultureOrg = (repos) =>
    repos.filter((r) => r.name.startsWith(github.andcultureOrg));

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

const _getConfigContents = (token) => `
machine api.github.com
  login ${token}
`;

//#endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = github;

// #endregion Exports
