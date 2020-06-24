// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const constants  = require("./constants");
const formatters = require("./formatters");
const shell      = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

const columnLength                   = 65;
const { purple, green, red, yellow } = formatters;

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Functions
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
            shell.echo(`${echo.sdkString} ${message}`);
            return;
        }
        shell.echo(`${echo.sdkString} ${" ".repeat(halfLength)}${message}`)
    },
    divider() {
        shell.echo(`${echo.sdkString} ${"-".repeat(columnLength)}`);
    },
    error(message) {
        shell.echo(`${echo.sdkString} ${red(constants.ERROR_OUTPUT_STRING)} ${message}`);
    },
    errors(messages) {
        for (const message of messages) {
            this.error(message);
        }
    },
    headerError(message) {
        this.newLine();
        this.divider();
        this.newLine();
        this.error(message);
        this.newLine();
        this.divider();
        this.newLine();
    },
    message(message) {
        shell.echo(`${echo.sdkString} ${message}`);
    },
    newLine() {
        shell.echo();
    },
    sdkString: purple("[and-cli]"),
    success(message) {
        message = `${this.sdkString} ${green(message)}`;

        shell.echo(message);

        return message;
    },
    warn(message) {
        shell.echo(`${echo.sdkString} ${yellow(constants.WARN_OUTPUT_STRING)} ${message}`)
    },
}

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = echo;

// #endregion Exports
