// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const child_process = require("child_process");
const shell         = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Full module mocks
// -----------------------------------------------------------------------------------------

// We aren't displaying or testing any of the output formatters right now.
jest.mock("./_modules/formatters");

// #endregion Full module mocks

// -----------------------------------------------------------------------------------------
// #region child_process mocks
// -----------------------------------------------------------------------------------------

// Globally mocking spawn and spawnSync to prevent tests from firing off child processes
child_process.spawn     = jest.fn();
child_process.spawnSync = jest.fn(() => {
    return {
        status: 0,
        stderr: "",
        stdout: "",
    };
});

// #endregion child_process mocks

// -----------------------------------------------------------------------------------------
// #region shelljs mocks
// -----------------------------------------------------------------------------------------

// Globally mocking shell.echo to suppress additional output
shell.echo = jest.fn();

// Globally mocking shell.exec to prevent tests from firing off child processes
shell.exec = jest.fn(() => {
    return {
        code: 0,
        stderr: "",
        stdout: "",
    };
});

// Globally mocking shell.exit to prevent exit calls from killing tests
shell.exit = jest.fn();

// #endregion shelljs mocks
