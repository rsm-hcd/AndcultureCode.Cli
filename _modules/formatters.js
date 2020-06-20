// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const variables = require("./variables");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

const { colors } = variables;

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Color formatters
// -----------------------------------------------------------------------------------------

exports.red    = (message) => `${colors.red}${message}${colors.clear}`;
exports.yellow = (message) => `${colors.yellow}${message}${colors.clear}`;
exports.purple = (message) => `${colors.purple}${message}${colors.clear}`;
exports.white  = (message) => `${colors.white}${message}${colors.clear}`;
exports.green  = (message) => `${colors.green}${message}${colors.clear}`;

// #endregion Color formatters

// -----------------------------------------------------------------------------------------
// #region Spacing formatters
// -----------------------------------------------------------------------------------------

exports.tab           = (message, times = 3) => "\t".repeat(times) + message;
exports.tabbedNewLine = (message, times = 3) => "\n" + this.tab(message, times);

// #endregion Spacing formatter
