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
    center(message) {
        const halfLength = (columnLength - message.length) / 2;
        if (halfLength < 0) {
            shell.echo(`${this.sdkString} ${message}`);
            return;
        }
        shell.echo(`${this.sdkString} ${" ".repeat(halfLength)}${message}`)
    },
    divider() {
        shell.echo(`${this.sdkString} ${"-".repeat(columnLength)}`);
    },
    error(message) {
        shell.echo(`${this.sdkString} ${red(constants.ERROR_OUTPUT_STRING)} ${message}`);
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
        shell.echo(`${this.sdkString} ${message}`);
    },
    newLine() {
        shell.echo();
    },
    sdkString: purple("[and-cli]"),
    success(message) {
        shell.echo(`${this.sdkString} ${green(message)}`)
    },
    warn(message) {
        shell.echo(`${this.sdkString} ${yellow(constants.WARN_OUTPUT_STRING)} ${message}`)
    },
}

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = echo;

// #endregion Exports
