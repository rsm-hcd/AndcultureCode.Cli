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
            shell.echo(`${this.sdkString} ${message}`);
            return;
        }
        shell.echo(`${this.sdkString} ${" ".repeat(halfLength)}${message}`);
    },
    divider() {
        shell.echo(`${this.sdkString} ${"-".repeat(columnLength)}`);
    },
    error(message) {
        shell.echo(
            `${this.sdkString} ${red(constants.ERROR_OUTPUT_STRING)} ${message}`
        );
    },
    errors(messages) {
        for (const message of messages) {
            this.error(message);
        }
    },
    header(message) {
        header(() => this.message(message));
    },
    headerError(message) {
        header(() => this.error(message));
    },
    headerSuccess(message) {
        header(() => this.success(message));
    },
    message(message) {
        shell.echo(`${this.sdkString} ${message}`);
    },
    newLine(includePrefix) {
        shell.echo(includePrefix ? this.sdkString : "");
    },
    sdkString: purple("[and-cli]"),
    success(message) {
        message = `${this.sdkString} ${green(message)}`;

        shell.echo(message);

        return message;
    },
    warn(message) {
        shell.echo(
            `${this.sdkString} ${yellow(
                constants.WARN_OUTPUT_STRING
            )} ${message}`
        );
    },
};

// #endregion Public Functions

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

const header = (bodyCallback) => {
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
