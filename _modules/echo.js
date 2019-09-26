/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const variables = require("./variables");
const shell     = require("shelljs");


/**************************************************************************************************
 * Functions
 **************************************************************************************************/

// #region Echo commands

const columnLength = 65;

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

// #endregion Echo commands


/**************************************************************************************************
 * Exports
 **************************************************************************************************/

module.exports = echo;