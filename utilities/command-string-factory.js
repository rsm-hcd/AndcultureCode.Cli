// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const {
    CollectionUtils,
    StringUtils,
} = require("andculturecode-javascript-core");
const echo = require("../modules/echo");
const shell = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

const _buildString = (cmd = "", args = []) => {
    let fullCommandString = cmd;

    // Only append a space with the concatenated array of args if it contains a value
    // Some commands do not require any additional arguments.
    if (
        CollectionUtils.hasValues(args) &&
        StringUtils.hasValue(args.join(" "))
    ) {
        fullCommandString = `${fullCommandString} ${args.join(" ")}`;
    }

    return fullCommandString;
};

const _sanitizeArgs = (args = []) =>
    args.filter((arg) => StringUtils.hasValue(arg));

/**
 * String-like object with 'cmd' and 'args' properties for ease of use with `child_process.spawnSync`
 *
 * @see command-string-type.ts
 * @class CommandString
 * @extends {String}
 */
class CommandString extends String {
    constructor(cmd = "", ...args) {
        const stringValue = _buildString(cmd, args);

        super(stringValue);

        this.cmd = cmd;
        this.args = args;
    }
}

const _validateOrExit = (cmd = "") => {
    if (StringUtils.hasValue(cmd)) {
        return;
    }

    echo.error("Command is required");
    shell.exit(1);
};

// #endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Public Functions
// -----------------------------------------------------------------------------------------

const commandStringFactory = {
    /**
     * Factory function to return a `CommandString` object based on the given command & arguments
     *
     * @param {string} [cmd=""] Base command to be executed, ie `dotnet`
     * @param {string[]} [args=[]] Any additional arguments that need to be passed along with the
     * base command, such as `build`
     * @returns {CommandString}
     */
    build(cmd = "", ...args) {
        _validateOrExit(cmd);

        // Filter out any undefined/null, or whitespace arguments
        args = _sanitizeArgs(args);

        return new CommandString(cmd, ...args);
    },
};

// #endregion Public Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = commandStringFactory;

// #endregion Exports
