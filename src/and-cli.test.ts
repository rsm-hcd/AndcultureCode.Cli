import { Commands } from "./modules/commands";
import { Constants } from "./modules/constants";
import { givenOptions, shouldDisplayHelpMenu } from "./tests/shared-specs";
import { TestUtils } from "./tests/test-utils";

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("and-cli", () => {
    // -----------------------------------------------------------------------------------------
    // #region commands
    // -----------------------------------------------------------------------------------------

    describe("commands", () => {
        // Pull out the flattened list of command objects from 'commands' module
        const commandObjects = Object.keys(Commands).map(
            (key) => Commands[key]
        );
        const commandStrings = commandObjects.map((obj) => obj.command);

        givenOptions(commandStrings, (command: string) =>
            // Each registered sub-command should display its respective help menu. This will help
            // ensure each new command is at least run during the build, even if the developer
            // forgets to add a test file specifically for it.
            shouldDisplayHelpMenu(command)
        );

        test("given no commands, it lists each command and description in the commands module", async () => {
            // Arrange & Act
            const result = await TestUtils.executeCliCommand();

            // Assert
            commandObjects.forEach((commandObject) => {
                expect(result).toContain(commandObject.command);

                // Normally, we'd be able to get away with just comparing the entire description string
                // against the result output. In the newer versions of Commander, it seems to wrap
                // longer descriptions onto new lines. We'll just verify that every 'word' of
                // the description exists in the result string.
                const descriptionWords = commandObject.description.split(" ");
                descriptionWords.forEach((word: string) => {
                    expect(result).toContain(word);
                });
            });
        });

        test("given all invalid commands or options, it displays an error", async () => {
            // Arrange & Act
            try {
                await TestUtils.executeCliCommand("apple peach pineapple");
            } catch (error) {
                // Assert
                expect(error).toContain(Constants.UNKNOWN_COMMAND);
            }

            // If the above function did not throw, this should fail the test.
            expect.assertions(1);
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
