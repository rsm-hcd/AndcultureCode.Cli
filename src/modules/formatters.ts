import { Variables } from "./variables";

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

const { colors } = Variables;

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

const _red = (message: string) => `${colors.red}${message}${colors.clear}`;
const _yellow = (message: string) =>
    `${colors.yellow}${message}${colors.clear}`;
const _purple = (message: string) =>
    `${colors.purple}${message}${colors.clear}`;
const _white = (message: string) => `${colors.white}${message}${colors.clear}`;
const _green = (message: string) => `${colors.green}${message}${colors.clear}`;

const _tab = (message: string, times: number = 3) =>
    "\t".repeat(times) + message;
const _tabbedNewLine = (message: string, times: number = 3) =>
    "\n" + _tab(message, times);

// #endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

const Formatters = {
    green: _green,
    purple: _purple,
    red: _red,
    tab: _tab,
    tabbedNewLine: _tabbedNewLine,
    white: _white,
    yellow: _yellow,
};

export { Formatters };

// #endregion Exports
