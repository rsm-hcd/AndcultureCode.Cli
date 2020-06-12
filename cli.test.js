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
    // #region commands
    // -----------------------------------------------------------------------------------------

    describe("commands", () => {
        // Pull out the flattened list of command objects from 'commands' module
        const commandObjects = Object.keys(commands).map((key) => commands[key]);
        const commandStrings = commandObjects.map((obj) => obj.command);

        whenGivenOptions(commandStrings, (command) =>
            // Each registered sub-command should display its respective help menu. This will help
            // ensure each new command is at least run during the build, even if the developer
            // forgets to add a test file specifically for it.
            shouldDisplayHelpMenu(command)
        );

        test("when given no commands, it lists each command and description in the commands module", async () => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand("");

            // Assert
            commandObjects.forEach((commandObject) => {
                expect(result).toContain(commandObject.command);
                expect(result).toContain(commandObject.description);
            });
        });

        test("when given all invalid commands or options, it displays the help menu", async () => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand("apple peach pineapple");

            // Assert
            expect(result).toContain(HELP_DESCRIPTION);
        });


    });

    // #endregion commands

    // -----------------------------------------------------------------------------------------
    // #region help
    // -----------------------------------------------------------------------------------------

    shouldDisplayHelpMenu("");

    // #endregion help
});

// #endregion Tests
