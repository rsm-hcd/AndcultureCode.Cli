// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const { HELP_OPTIONS } = require("./_modules/constants");
const commands         = require("./_modules/commands");
const testUtils        = require("./tests/test-utils");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("cli", () => {
    // -----------------------------------------------------------------------------------------
    // #region -h, --help
    // -----------------------------------------------------------------------------------------

    describe(HELP_OPTIONS, () => {
        test.each`
            option
            ${"-h"}
            ${"--help"}
        `("when passed '$option', it displays the help menu", async ({ option }) => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand("", [option]);

            // Assert
            expect(result).toContain(HELP_OPTIONS);
        });
    });

    // #endregion -h, --help

    // -----------------------------------------------------------------------------------------
    // #region options
    // -----------------------------------------------------------------------------------------

    describe("options", () => {
        test("when given no options, it lists each command and description in the commands module", async () => {
            // Arrange
            const flattenedCommands = Object.keys(commands).map((key) => commands[key]);

            // Act
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
            expect(result).toContain(HELP_OPTIONS);
        });
    });

    // #endregion options
});

// #endregion Tests
