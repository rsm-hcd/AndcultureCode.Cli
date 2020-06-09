// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

let shell = jest.requireActual("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

/**
 * Mocked version of `shelljs` module for testing purposes.
 */
shell = {
    // Merging in the actual implementation of shelljs functions/fields we don't necessarily
    // need or care to mock. See https://jestjs.io/docs/en/manual-mocks for more information.
    ...shell,

    /**
     * Globally mocking shell.echo to suppress additional output
     */
    echo: jest.fn(),
    /**
     * Globally mocking shell.exec to prevent tests from firing off child processes
     */
    exec: jest.fn(() => {
        return {
            code: 0,
            stderr: "",
            stdout: "",
        };
    }),
    /**
     * Globally mocking shell.exit to prevent exit calls from killing tests
     */
    exit: jest.fn(),
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = shell;

// #endregion Exports
