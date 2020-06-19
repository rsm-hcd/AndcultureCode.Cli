// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const echo   = require("./echo");
const fkill  = require("fkill");
const psList = require("ps-list");
const shell  = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const _defaultKillOptions = {
    /**
     * Force kill the process.
     */
    force: true,

    /**
     * Ignore capitalization when killing a process.
     *
     * Note that the case is always ignored on Windows.
     */
    ignoreCase: true,

    /**
     * Suppress all error messages. For example: `Process doesn't exist.`
     */
    silent: true,

    /**
     * Kill all child processes along with the parent process. _(Windows only)_
     */
    tree: true,
};

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const ps = {
    DEFAULT_KILL_OPTIONS: _defaultKillOptions,
    async kill(input, options = _defaultKillOptions) {
        try {
            await fkill(input, options)
        } catch (error) {
            echo.error(`There was an error killing processes ${input}: ${error}`);
            shell.exit(1);
        }

        return 0;
    },
    async list(name = null) {
        let processes = [];
        try {
            processes = await psList();
        } catch (error) {
            echo.error(`There was an error retrieving the process list: ${error}`);
            shell.exit(1);
        }

        if (name != null) {
            processes = processes.filter((process) => process.name.match(name));
        }

        return processes;
    }
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = ps;

// #endregion Exports
