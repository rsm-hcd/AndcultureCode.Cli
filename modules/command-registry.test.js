// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const { CLI_NAME, NODE_MODULES } = require("./constants");
const commandRegistry = require("./command-registry");
const echo = require("./echo");
const faker = require("faker");
const path = require("path");
const program = require("../and-cli");
const testUtils = require("../tests/test-utils");
const commands = require("./commands");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const BASE_COMMAND_DEFINITIONS = Object.keys(commands).map(
    (key) => commands[key]
);

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("commandRegistry", () => {
    // -----------------------------------------------------------------------------------------
    // #region Setup
    // -----------------------------------------------------------------------------------------

    beforeEach(() => {
        // In order to prevent test flakiness due to runtime order, we need to clear out
        // the cached program instance command array. Each test should have the appropriate setup steps
        // to configure the program commands, if needed.
        program.commands = [];
    });

    /**
     * Utility function for generating a `CommandDefinition` with a unique name and description.
     *
     * The command name should never match one in our command definition module because we are using
     * a guid for the name.
     *
     * @returns {CommandDefinition}
     */
    const seedRandomCommand = () => {
        return {
            // Intentionally generating a guid here instead of a random word, which might match
            // an actual like 'copy' or 'install'
            command: faker.random.uuid(),
            description: faker.random.words(),
        };
    };

    // #endregion Setup

    // -----------------------------------------------------------------------------------------
    // #region clear
    // -----------------------------------------------------------------------------------------

    describe("clear", () => {
        test("it assigns the program.commands array to an empty array", () => {
            // Arrange
            const { command, description } = seedRandomCommand();
            program.command(command, description);

            // Act
            commandRegistry.clear();

            // Assert
            expect(program.commands).toStrictEqual([]);
        });
    });

    // #endregion clear

    // -----------------------------------------------------------------------------------------
    // #region getBaseCommandDefinitions
    // -----------------------------------------------------------------------------------------

    describe("getBaseCommandDefinitions", () => {
        test("it returns a flat array of CommandDefinitions from the commands module", () => {
            // Arrange & Act
            const result = commandRegistry.getBaseCommandDefinitions();

            // Assert
            BASE_COMMAND_DEFINITIONS.forEach((commandDefinition) => {
                expect(result).toContain(commandDefinition);
            });
        });
    });

    // #endregion getBaseCommandDefinitions

    // -----------------------------------------------------------------------------------------
    // #region getCommand
    // -----------------------------------------------------------------------------------------

    describe("getCommand", () => {
        test.each([undefined, null, "", " "])(
            "when called with %p, it returns undefined",
            (name) => {
                // Arrange & Act
                const result = commandRegistry.getCommand(name);

                // Assert
                expect(result).toBeUndefined();
            }
        );

        describe("given the command is not registered", () => {
            test("when called with the command name, it returns undefined", () => {
                // Arrange
                const { command } = seedRandomCommand();

                // Act
                const result = commandRegistry.getCommand(command);

                // Assert
                expect(result).toBeUndefined();
            });
        });

        describe("given a command is registered", () => {
            test("when called with that name, it returns the specified command", () => {
                // Arrange
                const { command, description } = seedRandomCommand();
                program.command(command, description);

                // Act
                const result = commandRegistry.getCommand(command);

                // Assert
                expect(result).not.toBeNull();
                expect(result.name()).toBe(command);
            });

            test("when called with that name in any casing, it returns the specified command", () => {
                // Arrange
                const { command, description } = seedRandomCommand();
                const randomCaseName = testUtils.randomCase(command);
                program.command(command, description);

                // Act
                const result = commandRegistry.getCommand(randomCaseName);

                // Assert
                expect(result).not.toBeNull();
                expect(result.name()).toBe(command);
            });
        });
    });

    // #endregion getCommand

    // -----------------------------------------------------------------------------------------
    // #region initialize
    // -----------------------------------------------------------------------------------------

    describe("initialize", () => {
        test.each([undefined, null])(
            "when called with %p, it exits with an error",
            (isImportedModuleValue) => {
                // Arrange
                const shellExitSpy = testUtils.spyOnShellExit();
                const echoErrorSpy = jest.spyOn(echo, "error");

                // Act
                commandRegistry.initialize(isImportedModuleValue);

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalledWith(1);
            }
        );

        test("given initialize has been called, when called again, it exits with an error", () => {
            // Arrange
            const shellExitSpy = testUtils.spyOnShellExit();
            const echoErrorSpy = jest.spyOn(echo, "error");
            commandRegistry.initialize(faker.random.boolean());

            // Act
            commandRegistry.initialize(faker.random.boolean());

            // Assert
            expect(echoErrorSpy).toHaveBeenCalled();
            expect(shellExitSpy).toHaveBeenCalledWith(1);
        });
    });

    // #endregion initialize

    // -----------------------------------------------------------------------------------------
    // #region registerBaseCommand
    // -----------------------------------------------------------------------------------------

    describe("registerBaseCommand", () => {
        test.each([undefined, null, "", " "])(
            "when called with %p, it exits with an error",
            (name) => {
                // Arrange
                const shellExitSpy = testUtils.spyOnShellExit();
                const echoErrorSpy = jest.spyOn(echo, "error");

                // Act
                commandRegistry.registerBaseCommand(name);

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalledWith(1);
            }
        );

        describe("given command is not defined in commands module", () => {
            test("when called with command name, it exits with an error", () => {
                // Arrange
                const { command } = seedRandomCommand();
                const shellExitSpy = testUtils.spyOnShellExit();
                const echoErrorSpy = jest.spyOn(echo, "error");

                // Act
                commandRegistry.registerBaseCommand(command);

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalledWith(1);
            });
        });

        describe("given command is registered", () => {
            test("when called with command name and 'overrideIfRegistered' false, it outputs a warning", () => {
                // Arrange
                const { command, description } = faker.random.arrayElement(
                    BASE_COMMAND_DEFINITIONS
                );
                const overrideIfRegistered = false; // This is the important setup
                program.command(command, description);
                const echoWarnSpy = jest.spyOn(echo, "warn");

                // Act
                commandRegistry.registerBaseCommand(
                    command,
                    overrideIfRegistered
                );

                // Assert
                expect(echoWarnSpy).toHaveBeenCalled();
            });

            test("when called with command name and 'overrideIfRegistered' true, it calls program.command", () => {
                // Arrange
                const { command, description } = faker.random.arrayElement(
                    BASE_COMMAND_DEFINITIONS
                );
                const overrideIfRegistered = true; // This is the important setup
                program.command(command, description);
                const programCommandSpy = jest.spyOn(program, "command");

                // Act
                commandRegistry.registerBaseCommand(
                    command,
                    overrideIfRegistered
                );

                // Assert
                expect(programCommandSpy).toHaveBeenCalled();
            });
        });

        describe("given command is not already registered", () => {
            describe("given 'isImportedModule' is initialized to true", () => {
                test(`it calls program.command with a file path pointing to ${NODE_MODULES}`, () => {
                    // Arrange
                    const { command, description } = faker.random.arrayElement(
                        BASE_COMMAND_DEFINITIONS
                    );
                    // The expected file path should point to ./node_modules/and-cli/and-cli-{commandName}.js
                    const expectedFilePath = path.join(
                        ".",
                        NODE_MODULES,
                        CLI_NAME,
                        `${CLI_NAME}-${command}.js`
                    );
                    commandRegistry.initialize(true); // This is the important setup
                    const programCommandSpy = jest.spyOn(program, "command");

                    // Act
                    commandRegistry.registerBaseCommand(command);

                    // Assert
                    expect(programCommandSpy).toHaveBeenCalled();
                    expect(programCommandSpy).toHaveBeenCalledWith(
                        command,
                        description,
                        {
                            executableFile: expectedFilePath,
                        }
                    );
                });
            });

            describe("given 'isImportedModule' is initialized to false", () => {
                test(`it calls program.command with a file path pointing to current directory`, () => {
                    // Arrange
                    const { command, description } = faker.random.arrayElement(
                        BASE_COMMAND_DEFINITIONS
                    );
                    // The expected file path should point to ./and-cli-{commandName}.js
                    const expectedFilePath = path.join(
                        ".",
                        `${CLI_NAME}-${command}.js`
                    );
                    commandRegistry.initialize(false); // This is the important setup
                    const programCommandSpy = jest.spyOn(program, "command");

                    // Act
                    commandRegistry.registerBaseCommand(command);

                    // Assert
                    expect(programCommandSpy).toHaveBeenCalled();
                    expect(programCommandSpy).toHaveBeenCalledWith(
                        command,
                        description,
                        {
                            executableFile: expectedFilePath,
                        }
                    );
                });
            });
        });
    });

    // #endregion registerBaseCommand

    // -----------------------------------------------------------------------------------------
    // #region registerBaseCommands
    // -----------------------------------------------------------------------------------------

    describe("registerBaseCommands", () => {
        test("it calls registerBaseCommand for each base command", () => {
            // Arrange
            const programCommandSpy = jest.spyOn(program, "command");

            // Act
            commandRegistry.registerBaseCommands();

            // Assert
            expect(programCommandSpy).toHaveBeenCalledTimes(
                BASE_COMMAND_DEFINITIONS.length
            );
        });
    });

    // #endregion registerBaseCommands

    // -----------------------------------------------------------------------------------------
    // #region registerCommand
    // -----------------------------------------------------------------------------------------

    describe("registerCommand", () => {
        describe("given command is registered", () => {
            test("when called with command name and 'overrideIfRegistered' false, it outputs a warning", () => {
                // Arrange
                const commandDefinition = seedRandomCommand();
                const { command, description } = commandDefinition;
                const overrideIfRegistered = false; // This is the important setup
                program.command(command, description);
                const echoWarnSpy = jest.spyOn(echo, "warn");

                // Act
                commandRegistry.registerCommand(
                    commandDefinition,
                    overrideIfRegistered
                );

                // Assert
                expect(echoWarnSpy).toHaveBeenCalled();
            });

            test("when called with command name and 'overrideIfRegistered' true, it calls program.command", () => {
                // Arrange
                const commandDefinition = seedRandomCommand();
                const { command, description } = commandDefinition;
                const overrideIfRegistered = true; // This is the important setup
                program.command(command, description);
                const programCommandSpy = jest.spyOn(program, "command");

                // Act
                commandRegistry.registerCommand(
                    commandDefinition,
                    overrideIfRegistered
                );

                // Assert
                expect(programCommandSpy).toHaveBeenCalledWith(
                    command,
                    description
                );
            });
        });

        describe("given command is not already registered", () => {
            test("it calls program.command", () => {
                // Arrange
                const commandDefinition = seedRandomCommand();
                const { command, description } = commandDefinition;
                const overrideIfRegistered = faker.random.boolean(); // This shouldn't matter
                const programCommandSpy = jest.spyOn(program, "command");

                // Act
                commandRegistry.registerCommand(
                    commandDefinition,
                    overrideIfRegistered
                );

                // Assert
                expect(programCommandSpy).toHaveBeenCalledWith(
                    command,
                    description
                );
            });
        });
    });

    // #endregion registerCommand

    // -----------------------------------------------------------------------------------------
    // #region registerCommands
    // -----------------------------------------------------------------------------------------

    describe("registerCommands", () => {
        test.each([undefined, null, []])(
            "when called with a commands array value of %p, it does not call registerCommand",
            (commands) => {
                // Arrange
                const registerCommandSpy = jest.spyOn(
                    commandRegistry,
                    "registerCommand"
                );

                // Act
                commandRegistry.registerCommands(commands);

                // Assert
                expect(registerCommandSpy).not.toHaveBeenCalled();
            }
        );

        test("when commands array has values, it calls registerCommand for each command", () => {
            // Arrange
            const commandCount = testUtils.randomNumber(1, 10);
            const commands = [];
            for (let i = 0; i < commandCount; i++) {
                commands.push(seedRandomCommand());
            }
            const programCommandSpy = jest.spyOn(program, "command");

            // Act
            commandRegistry.registerCommands(commands);

            // Assert
            expect(programCommandSpy).toHaveBeenCalledTimes(commandCount);
        });
    });

    // #endregion registerCommands

    // -----------------------------------------------------------------------------------------
    // #region removeCommand
    // -----------------------------------------------------------------------------------------

    describe("removeCommand", () => {
        test.each([undefined, null, "", " "])(
            "when called with %p, it does create new commands array",
            (value) => {
                // Arrange
                // Save a reference to the original array to ensure we are creating a new one
                const expectedCommands = program.commands;

                // Act
                commandRegistry.removeCommand(value);

                // Assert
                expect(program.commands).toBe(expectedCommands); // Using toBe matcher for referential equality
            }
        );

        test("when called with command that does not exist, it does not modify commands array", () => {
            // Arrange
            const { command } = seedRandomCommand();
            const expectedCommands = program.commands;

            // Act
            commandRegistry.removeCommand(command);

            // Assert
            expect(program.commands).toStrictEqual(expectedCommands);
        });

        test("when called with command that exists, it returns a new command array without that command", () => {
            // Arrange
            const { command, description } = seedRandomCommand();
            program.command(command, description);
            const expectedCommands = [];

            // Act
            commandRegistry.removeCommand(command);

            // Assert
            expect(program.commands).toStrictEqual(expectedCommands);
        });
    });

    // #endregion removeCommand
});

// #endregion Tests
