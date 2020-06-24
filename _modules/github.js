// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const { echo } = require("shelljs");
const { Octokit } = require("@octokit/rest");
const { success } = require("./echo");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const organization = "AndcultureCode";

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Public Functions
// -----------------------------------------------------------------------------------------

const github = {
    cmd() {
        return {
            args: [],
            cmd: "gh",
            toString() {
                return `${this.cmd} ${this.args.join(" ")}`;
            },
        };
    },
    options() {
        return [];
    },
    description() {
        return `Helpful github operations used at andculture (via ${this.cmd()})`;
    },
    /**
     * Lists all AndcultureCode organization repositories
     */
    async listRepositories() {
        const client = _getClient();

        let repos = [];

        await client.paginate(client.repos.listForOrg, {
            org: organization,
            type: "public"
        }).then((response) => {
            repos = repos.concat(response);
            return response;
        });

        repos = repos.filter((r) => r.name.startsWith(organization));

        for (let i = 0; i < repos.length; i++) {
            const repo = repos[i];

            console.log(repo.name);
        }

        return 0;
    },
};

// #endregion Public Functions

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

const _getClient = (username, password) => {
    const options = {};

    return new Octokit(options);
};

//#endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = github;

// #endregion Exports