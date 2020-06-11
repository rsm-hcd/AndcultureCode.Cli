// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const { HELP_OPTIONS, HELP_DESCRIPTION } = require("../_modules/constants");
const testUtils = require("./test-utils");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const _whenGivenOptions = (options, expectedOutcome, fn) => {
    describe(options.join(", "), () => {
        test.each([options])(`when passed %p, ${expectedOutcome}`, ({ option }) => {
            fn(option);
        });
    });
};

const _shouldDisplayHelpMenu = async (command) =>
    _whenGivenOptions(HELP_OPTIONS, "it displays the help menu", async (option) => {
        // Arrange & Act
        const result = await testUtils.executeCliCommand(command, [option]);

        // Assert
        expect(result).toContain(HELP_DESCRIPTION);
    });


// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

const describes = {
    /**
     * Test spec ensuring that the given command properly displays the help menu provided by Commander
     *
     * This can be used as a simple 'health check' for parent-level commands to ensure they do not throw
     * runtime errors.
     */
    shouldDisplayHelpMenu: _shouldDisplayHelpMenu,
    /**
     * Describe/test wrapper for testing functionality of a command triggered by one or more options
     * from an array.
     */
    whenGivenOptions: _whenGivenOptions,
};

module.exports = describes;

// #endregion Exports

