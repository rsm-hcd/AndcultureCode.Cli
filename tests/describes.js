// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const {
    ERROR_OUTPUT_STRING,
    HELP_DESCRIPTION,
    HELP_OPTIONS,
} = require("../_modules/constants");
const testUtils = require("./test-utils");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

/**
 * Describe/test block for testing functionality of a command triggered by one or more options
 * from an array.
 *
 * @param {any[]} options Array of options to generate `describe` blocks for. Usually a string.
 * @param {(any) => void} fn Function to be run nested under the generated `describe` block. Can be
 * a test case or another `describe` block.
 */
const _whenGivenOptions = (options, fn) => {
    // Intentionally looping over each passed in option and calling describe() vs. using
    // describe.each() - async functions (tests) being passed in were running at the same time and
    // failing. Calling each describe manually seems to force them to run synchronously.
    options.forEach((option) => {
        describe(`when passed '${option}'`, () => {
            fn(option);
        });
    });
};

/**
 * Test spec ensuring that the given command properly displays the help menu provided by Commander
 *
 * This can be used as a simple 'health check' for parent-level commands to ensure they do not throw
 * runtime errors.
 *
 * @param {string} command The cli command to be run, such as `dotnet` or `webpack`
 * @returns
 */
const _shouldDisplayHelpMenu = (command) =>
    _whenGivenOptions(HELP_OPTIONS, (option) => {
        test("it displays the help menu", async () => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand(command, [option]);

            // Assert
            expect(result).toContain(HELP_DESCRIPTION);
        });
    });

/**
 * Test spec ensuring that the given command properly displays the an error string when run.
 * Defaults to the error constant specified for `echo.error()`, but can be overridden for a more
 * specific error message if needed.
 *
 * @param {async () => string} fn Function to run as the arrange & act steps of the test case. Should return
 * the output to be asserted against.
 * @param {string} [error=ERROR_OUTPUT_STRING] Error message to check for in the result output.
 */
const _shouldDisplayError = (fn, error = ERROR_OUTPUT_STRING) => {
    test("it displays an error", async () => {
        // Arrange & Act
        const result = await fn();

        // Assert
        expect(result).toContain(error);
    });
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

const describes = {
    shouldDisplayError: _shouldDisplayError,
    shouldDisplayHelpMenu: _shouldDisplayHelpMenu,
    whenGivenOptions: _whenGivenOptions,
};

module.exports = describes;

// #endregion Exports

