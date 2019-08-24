/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const variables = require("./variables");


/**************************************************************************************************
 * Variables
 **************************************************************************************************/

const { colors, symbols } = variables;

/**************************************************************************************************
 * Functions
 **************************************************************************************************/

// #region Color formatters

exports.red    = (message) => `${colors.red}${message}${colors.clear}`;
exports.yellow = (message) => `${colors.yellow}${message}${colors.clear}`;
exports.purple = (message) => `${colors.purple}${message}${colors.clear}`;
exports.white  = (message) => `${colors.white}${message}${colors.clear}`;
exports.green  = (message) => `${colors.green}${message}${colors.clear}`;

// #endregion Color formatters

// #region Dotnet formatters

exports.dotnet = (output) => {
    // NOTE: Temporarily parsing output due to shelljs.exec not preserving colored output correctly
    // See https://github.com/shelljs/shelljs/issues/86 for more info
    return output
        .replace(new RegExp(/(warning [A-Z]+[0-9]+:)/g), this.yellow("$1"))
        .replace(new RegExp(/(error [A-Z]+[0-9]+:)/g),   this.red("$1"))
        .replace(new RegExp(/([0-9]+ Warning\(s\))/g),   this.yellow("$1"))
        .replace(new RegExp(/([0-9]+ Error\(s\))/g),     this.red("$1"))
        .replace(new RegExp(/(Build FAILED\.)/g),        this.red("$1"));
};

// #endregion Dotnet formatters

// #region Spacing formatters

exports.tab           = (message, times = 3) => "\t".repeat(times) + message;
exports.tabbedNewLine = (message, times = 3) => "\n" + this.tab(message, times);

// #endregion Spacing formatters

// #region Jest formatters

exports.jest = (output) => {
    // NOTE: Temporarily parsing output due to shelljs.exec not preserving colored output correctly
    // See https://github.com/shelljs/shelljs/issues/86 for more info
    return output
        .replace(new RegExp("(Expected:)",      "g"), this.green("$1"))
        .replace(new RegExp("([0-9]* failed)",  "g"), this.red("$1"))
        .replace(new RegExp("([0-9]* passed)",  "g"), this.green("$1"))
        .replace(new RegExp("(Received:)",      "g"), this.red("$1"))
        .replace(new RegExp("([0-9]* skipped)", "g"), this.yellow("$1"))
        .replace(new RegExp(symbols.checkmark,  "g"), this.green(symbols.checkmark))
        .replace(new RegExp(symbols.o,          "g"), this.yellow(symbols.o))
        .replace(new RegExp(symbols.x,          "g"), this.red(symbols.x));
};

// #endregion Jest formatters