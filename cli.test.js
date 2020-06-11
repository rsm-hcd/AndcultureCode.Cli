// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const { HELP_DESCRIPTION } = require("./_modules/constants");
const commands             = require("./_modules/commands");
const testUtils            = require("./tests/test-utils");
const {
    shouldDisplayHelpMenu,
    whenGivenOptions
}                          = require("./tests/describes");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("cli", () => {
    // -----------------------------------------------------------------------------------------
    // #region -h, --help
    // -----------------------------------------------------------------------------------------

    shouldDisplayHelpMenu("");

    // #endregion -h, --help

    // -----------------------------------------------------------------------------------------
    // #region commands
    // -----------------------------------------------------------------------------------------

    describe("commands", () => {
        let flattenedCommands;

        beforeEach(() => {
            // Pull out the flattened list of commands from 'commands' module
            flattenedCommands = Object.keys(commands).map((key) => commands[key]);
        });

        test("when given no commands, it lists each command and description in the commands module", async () => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand("");

            // Assert
            flattenedCommands.forEach((flattenedCommand) => {
                expect(result).toContain(flattenedCommand.command);
                expect(result).toContain(flattenedCommand.description);
            });
        });

        test("when given all invalid commands or options, it displays the help menu", async () => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand("apple peach pineapple");

            // Assert
            expect(result).toContain(HELP_DESCRIPTION);
        });
    });

    // #endregion options
});

// #endregion Tests
