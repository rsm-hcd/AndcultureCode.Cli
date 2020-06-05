// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const shell     = require("shelljs");
const variables = require("./variables");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const columnLength = 65;

// #endregion Constants

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
        shell.echo(`${this.sdkString} ${variables.colors.red}[ERROR]${variables.colors.clear} ${message}`)
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
    sdkString: `${variables.colors.purple}[and-cli]${variables.colors.clear}`,
    success(message) {
        shell.echo(`${this.sdkString} ${variables.colors.green}${message}${variables.colors.clear}`)
    },
    warn(message) {
        shell.echo(`${this.sdkString} ${variables.colors.yellow}[WARN]${variables.colors.clear} ${message}`)
    },
}

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = echo;

// #endregion Exports
