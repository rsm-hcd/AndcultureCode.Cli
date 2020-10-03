// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const constants = require("./constants");
const formatters = require("./formatters");
const shell = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

const columnLength = 65;
const { purple, green, red, yellow } = formatters;
const prefix = purple(`[${constants.CLI_NAME}]`);

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Public Functions
// -----------------------------------------------------------------------------------------

const echo = {
    /**
     * Echos specific property value for each item in a list
     * @param {array} list array of objects for which to print a property
     * @param {string} property property name to print on each line
     * @param {function} fn optional function to call on each iteration; if null, defaults to 'echo.message'
     */
    byProperty(list, property, fn) {
        if (list == null) {
            return;
        }

        if (fn == null) {
            fn = this.message;
        }

        list.forEach((item) => fn(item[property]));
    },
    center(message) {
        const halfLength = (columnLength - message.length) / 2;
        if (halfLength < 0) {
            shell.echo(`${prefix} ${message}`);
            return;
        }
        shell.echo(`${prefix} ${" ".repeat(halfLength)}${message}`);
    },
    divider() {
        shell.echo(`${prefix} ${"-".repeat(columnLength)}`);
    },
    error(message) {
        shell.echo(
            `${prefix} ${red(constants.ERROR_OUTPUT_STRING)} ${message}`
        );
    },
    errors(messages) {
        for (const message of messages) {
            this.error(message);
        }
    },
    header(message) {
        _header(() => this.message(message));
    },
    headerError(message) {
        _header(() => this.error(message));
    },
    headerSuccess(message) {
        _header(() => this.success(message));
    },
    message(message, includePrefix = true) {
        shell.echo(includePrefix ? `${prefix} ${message}` : message);
    },
    messages(messages, includePrefix = true) {
        messages.forEach((message) => this.message(message, includePrefix));
    },
    newLine(includePrefix) {
        shell.echo(includePrefix ? prefix : "");
    },
    sdkString: purple("[and-cli]"),
    success(message) {
        message = `${prefix} ${green(message)}`;

        shell.echo(message);

        return message;
    },
    warn(message) {
        shell.echo(
            `${prefix} ${yellow(constants.WARN_OUTPUT_STRING)} ${message}`
        );
    },
};

// #endregion Public Functions

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

const _header = (bodyCallback) => {
    echo.newLine();
    echo.divider();
    echo.newLine(true);

    if (bodyCallback !== null) {
        bodyCallback();
    }

    echo.newLine(true);
    echo.divider();
    echo.newLine();
};

// #endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = echo;

// #endregion Exports
