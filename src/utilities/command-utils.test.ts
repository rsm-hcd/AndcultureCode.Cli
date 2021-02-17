import { TestUtils } from "../tests/test-utils";
import { CommandUtils } from "./command-utils";
import program, { Command } from "commander";

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("CommandUtils", () => {
    // -----------------------------------------------------------------------------------------
    // #region Setup
    // -----------------------------------------------------------------------------------------

    const seedWithSubcommand = (name: string): program.Command =>
        new Command("parent").addCommand(new Command(name));

    // #endregion Setup

    // -----------------------------------------------------------------------------------------
    // #region equalsByName
    // -----------------------------------------------------------------------------------------

    describe("equalsByName", () => {
        test.todo(
            "TODO - https://github.com/AndcultureCode/AndcultureCode.Cli/issues/156"
        );
    });

    // #endregion equalsByName

    // -----------------------------------------------------------------------------------------
    // #region exists
    // -----------------------------------------------------------------------------------------

    describe("exists", () => {
        test.todo(
            "TODO - https://github.com/AndcultureCode/AndcultureCode.Cli/issues/156"
        );
    });

    // #endregion exists

    // -----------------------------------------------------------------------------------------
    // #region get
    // -----------------------------------------------------------------------------------------

    describe("get", () => {
        test.each([undefined, null, "", " "])(
            "when called with %p, it returns undefined",
            (name) => {
                // Arrange
                const command = new Command();

                // Act
                const result = CommandUtils.get(name as string, command);

                // Assert
                expect(result).toBeUndefined();
            }
        );

        describe("given the command is not registered", () => {
            test("when called with the command name, it returns undefined", () => {
                // Arrange
                const command = new Command();
                const name = TestUtils.randomWord();

                // Act
                const result = CommandUtils.get(name, command);

                // Assert
                expect(result).toBeUndefined();
            });
        });

        describe("given a command is registered", () => {
            test("when called with that name, it returns the specified command", () => {
                // Arrange
                const name = TestUtils.randomWord();
                const command = seedWithSubcommand(name);

                // Act
                const result = CommandUtils.get(name, command);

                // Assert
                expect(result).not.toBeNil();
                expect(result!.name()).toBe(name);
            });

            test("when called with that name in any casing, it returns the specified command", () => {
                // Arrange
                const name = TestUtils.randomWord();
                const randomCaseName = TestUtils.randomCase(name);
                const command = seedWithSubcommand(name);

                // Act
                const result = CommandUtils.get(randomCaseName, command);

                // Assert
                expect(result).not.toBeNil();
                expect(result!.name()).toBe(name);
            });
        });
    });

    // #endregion get

    // -----------------------------------------------------------------------------------------
    // #region remove
    // -----------------------------------------------------------------------------------------

    describe("remove", () => {
        test.each([undefined, null, "", " "])(
            "when called with %p, it returns unmodified list of commands",
            (name) => {
                // Arrange
                const command = seedWithSubcommand(TestUtils.randomWord());
                const expectedCommands = command.commands;

                // Act
                const result = CommandUtils.remove(name as string, command);

                // Assert
                expect(result.commands).toBe(expectedCommands);
            }
        );

        describe("given the command is not registered", () => {
            test("when called with the command name, it returns unmodified list of commands", () => {
                // Arrange
                const name = TestUtils.randomWord();
                const command = seedWithSubcommand(`not-${name}`);
                const expectedCommands = command.commands;

                // Act
                const result = CommandUtils.remove(name, command);

                // Assert
                expect(result.commands).toBe(expectedCommands);
            });
        });

        describe("given a command is registered", () => {
            test("when called with that name, it removes it from the list of commands", () => {
                // Arrange
                const name = TestUtils.randomWord();
                const command = seedWithSubcommand(name);
                const unexpected = command.commands[0];

                // Act
                const result = CommandUtils.remove(name, command);

                // Assert
                expect(result).not.toBeNil();
                expect(result.commands).not.toContain(unexpected);
            });

            test("when called with that name in any casing, it removes it from the list of commands", () => {
                // Arrange
                const name = TestUtils.randomWord();
                const randomCaseName = TestUtils.randomCase(name);
                const command = seedWithSubcommand(name);
                const unexpected = command.commands[0];

                // Act
                const result = CommandUtils.remove(randomCaseName, command);

                // Assert
                expect(result).not.toBeNil();
                expect(result.commands).not.toContain(unexpected);
            });
        });
    });

    // #endregion remove

    // -----------------------------------------------------------------------------------------
    // #region setDefault
    // -----------------------------------------------------------------------------------------

    describe("setDefault", () => {
        test.todo(
            "TODO - https://github.com/AndcultureCode/AndcultureCode.Cli/issues/156"
        );
    });

    // #endregion setDefault

    // -----------------------------------------------------------------------------------------
    // #region sort
    // -----------------------------------------------------------------------------------------

    describe("sort", () => {
        test.todo(
            "TODO - https://github.com/AndcultureCode/AndcultureCode.Cli/issues/156"
        );
    });

    // #endregion sort
});

// #endregion Tests
