import shell from "shelljs";
import { Formatters } from "./formatters";
import { Constants } from "./constants";
import { CollectionUtils, StringUtils } from "andculturecode-javascript-core";

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

const { purple, green, red, yellow } = Formatters;
const columnLength = 65;
const prefix = purple(`[${Constants.CLI_NAME}]`);

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Public Functions
// -----------------------------------------------------------------------------------------

const Echo = {
    /**
     * Echos specific property value for each item in a list
     * @param {array} list array of objects for which to print a property
     * @param {string} property property name to print on each line
     * @param {function} fn optional function to call on each iteration; if null, defaults to 'Echo.message'
     */
    byProperty(
        list?: Array<any>,
        property?: string,
        fn?: (property: any) => void
    ) {
        if (CollectionUtils.isEmpty(list) || StringUtils.isEmpty(property)) {
            return;
        }

        if (fn == null) {
            fn = this.message;
        }

        list!.forEach((item: any) => fn!(item[property!]));
    },
    center(message?: string) {
        message = message ?? "";

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
    error(message?: string) {
        shell.echo(
            `${prefix} ${red(Constants.ERROR_OUTPUT_STRING)} ${message}`
        );
    },
    errors(messages: string[]) {
        for (const message of messages) {
            this.error(message);
        }
    },
    header(message?: string) {
        _header(() => this.message(message));
    },
    headerError(message?: string) {
        _header(() => this.error(message));
    },
    headerSuccess(message?: string) {
        _header(() => this.success(message));
    },
    message(message?: string) {
        shell.echo(`${prefix} ${message}`);
    },
    json(obj: any) {
        shell.echo(JSON.stringify(obj, undefined, 4));
    },
    newLine(includePrefix: boolean = false) {
        shell.echo(includePrefix ? prefix : "");
    },
    success(message?: string) {
        message = `${prefix} ${green(message ?? "")}`;

        shell.echo(message);

        return message;
    },
    warn(message?: string) {
        shell.echo(
            `${prefix} ${yellow(Constants.WARN_OUTPUT_STRING)} ${message}`
        );
    },
};

// #endregion Public Functions

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

const _header = (bodyCallback: Function) => {
    Echo.newLine();
    Echo.divider();
    Echo.newLine(true);

    if (bodyCallback !== null) {
        bodyCallback();
    }

    Echo.newLine(true);
    Echo.divider();
    Echo.newLine();
};

// #endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { Echo };

// #endregion Exports
