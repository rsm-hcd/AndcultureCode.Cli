// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const { echo }    = require("./echo");
const { Octokit } = require("@octokit/rest");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Public Members
// -----------------------------------------------------------------------------------------

const github = {
    andcultureOrg: "AndcultureCode",
    apiRepositoriesRouteParam: "repos",
    apiRootUrl: "https://api.github.com",
    description() {
        return `Helpful github operations used at andculture`;
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
            return await _list(_client().repos.listForUser, { username }, filter);
        } catch (error) {
            echo.error(`There was an error listing repositories by user ${username}: ${error}`);
            return null;
        }
    },

    /**
     * Lists all andculture organization repositories
     * @param {string} username optional username of user account. if null, returns master andculture organization repositories
     */
    async repositoriesByAndculture(username) {
        const fn = username == null ? this.repositoriesByOrganization : this.repositories;
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
            type: "public"
        };

        try {
            return await _list(_client().repos.listForOrg, options, filter);
        } catch (error) {
            echo.error(`There was an error listing repositories by organization ${org}: ${error}`);
            return null;
        }
    },
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

/**
 * Retrieves all records for a given list command, accounting for pagination
 * @param {object} command
 * @param {object} options
 * @param {(results: object[]) => object[]} filter optional filter function to perform on result set
 */
const _list = async (command, options, filter) => {
    options.per_page = 100; // github api max

    let results = [];

    await _client().paginate(command, options).then((response) => {
        results = results.concat(response);
        return response;
    });

    if (filter != null) {
        results = filter(results);
    }

    return results;
}


//#endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = github;

// #endregion Exports
