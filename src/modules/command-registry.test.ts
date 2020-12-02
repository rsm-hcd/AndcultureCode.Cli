import { CommandDefinition } from "../types/command-definition-type";
import { CommandDefinitions } from "./commands";
import { Echo } from "./echo";
import program from "commander";
import { CommandRegistry } from "./command-registry";
import { PackageConfig } from "./package-config";
import { Constants } from "./constants";
import faker from "faker";
import { TestUtils } from "../tests/test-utils";
import upath from "upath";

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("CommandRegistry", () => {
    // -----------------------------------------------------------------------------------------
    // #region Setup
    // -----------------------------------------------------------------------------------------

    // Commonly spied functions
    let echoErrorSpy: jest.SpyInstance;
    let echoWarnSpy: jest.SpyInstance;
    let programCommandSpy: jest.SpyInstance;
    let shellExitSpy: jest.SpyInstance;

    beforeEach(() => {
        // In order to prevent test flakiness due to runtime order, we need to clear out
        // the cached program instance command array. Each test should have the appropriate setup steps
        // to configure the program commands, if needed.
        program.commands = [];

        echoErrorSpy = jest.spyOn(Echo, "error");
        echoWarnSpy = jest.spyOn(Echo, "warn");
        programCommandSpy = jest.spyOn(program, "command");
        shellExitSpy = TestUtils.spyOnShellExit();
    });

    /**
     * Utility function for generating a `CommandDefinition` with a unique name and description.
     *
     * The command name should never match one in our command definition module because we are using
     * a guid for the name.
     *
     * @returns {CommandDefinition}
     */
    const seedRandomCommand = (): CommandDefinition => {
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
            CommandRegistry.clear();

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
            const result = CommandRegistry.getBaseCommandDefinitions();

            // Assert
            CommandDefinitions.forEach((commandDefinition) => {
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
                const result = CommandRegistry.getCommand(
                    (name as any) as string
                );

                // Assert
                expect(result).toBeUndefined();
            }
        );

        describe("given the command is not registered", () => {
            test("when called with the command name, it returns undefined", () => {
                // Arrange
                const { command } = seedRandomCommand();

                // Act
                const result = CommandRegistry.getCommand(command);

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
                const result = CommandRegistry.getCommand(command);

                // Assert
                expect(result).not.toBeNull();
                expect(result!.name()).toBe(command);
            });

            test("when called with that name in any casing, it returns the specified command", () => {
                // Arrange
                const { command, description } = seedRandomCommand();
                const randomCaseName = TestUtils.randomCase(command);
                program.command(command, description);

                // Act
                const result = CommandRegistry.getCommand(randomCaseName);

                // Assert
                expect(result).not.toBeNull();
                expect(result!.name()).toBe(command);
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
                // Arrange & Act
                CommandRegistry.initialize(
                    (isImportedModuleValue as any) as boolean
                );

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalledWith(1);
            }
        );

        test("given initialize has been called, when called again, it exits with an error", () => {
            // Arrange
            CommandRegistry.initialize(faker.random.boolean());

            // Act
            CommandRegistry.initialize(faker.random.boolean());

            // Assert
            expect(echoErrorSpy).toHaveBeenCalled();
            expect(shellExitSpy).toHaveBeenCalledWith(1);
        });
    });

    // #endregion initialize

    // -----------------------------------------------------------------------------------------
    // #region parseWithAliases
    // -----------------------------------------------------------------------------------------

    describe("parseWithAliases", () => {
        let programParseSpy: jest.SpyInstance;
        beforeEach(() => {
            programParseSpy = jest.spyOn(program, "parse").mockImplementation();
        });

        describe("given no aliases are registered", () => {
            test("it calls program.parse with process.argv", () => {
                // Arrange
                const expectedArgv = [
                    TestUtils.randomWord(),
                    TestUtils.randomWord(),
                    TestUtils.randomWord(),
                ];
                // Cloning to ensure we have a separate reference to work with
                process.argv = [...expectedArgv];

                // Act
                CommandRegistry.parseWithAliases();

                // Assert
                expect(programParseSpy).toHaveBeenCalledWith(expectedArgv); // The test should fail if something modifies process.argv in-place
            });
        });

        describe("given at least one alias is registered", () => {
            test("when < 3 args are provided, it calls program.parse with process.argv", () => {
                // Arrange
                const commandDefinition = seedRandomCommand();
                CommandRegistry.registerAlias(commandDefinition);
                const expectedArgv = [];

                // This is the important setup
                const argvCount = TestUtils.randomNumber(0, 2);
                for (let i = 0; i < argvCount; i++) {
                    expectedArgv.push(TestUtils.randomWord());
                }

                // Cloning to ensure we have a separate reference to work with
                process.argv = [...expectedArgv];

                // Act
                CommandRegistry.parseWithAliases();

                // Assert
                expect(programParseSpy).toHaveBeenCalledWith(expectedArgv); // The test should fail if something modifies process.argv in-place
            });

            test("when > 3 args are provided, it calls program.parse with process.argv", () => {
                // Arrange
                const commandDefinition = seedRandomCommand();
                CommandRegistry.registerAlias(commandDefinition);
                const expectedArgv = [];

                // This is the important setup
                const argvCount = TestUtils.randomNumber(4, 100);
                for (let i = 0; i < argvCount; i++) {
                    expectedArgv.push(TestUtils.randomWord());
                }

                // Cloning to ensure we have a separate reference to work with
                process.argv = [...expectedArgv];

                // Act
                CommandRegistry.parseWithAliases();

                // Assert
                expect(programParseSpy).toHaveBeenCalledWith(expectedArgv); // The test should fail if something modifies process.argv in-place
            });

            test("when 3rd arg matching an alias provided, it calls program.parse with transformed args", () => {
                // Arrange
                const commandDefinition = seedRandomCommand();
                const { command: alias } = commandDefinition;
                const transformedCommand = commandDefinition.description.split(
                    " "
                );
                CommandRegistry.registerAlias(commandDefinition);
                // First two args don't really matter
                process.argv = [
                    TestUtils.randomWord(),
                    TestUtils.randomWord(),
                    alias, // This is the important setup
                ];

                // Act
                CommandRegistry.parseWithAliases();

                // Assert
                expect(programParseSpy).toHaveBeenCalledWith(
                    transformedCommand,
                    { from: "user" }
                );
            });

            test("when 3rd arg does not match any alias, it calls program.parse with process.argv", () => {
                // Arrange
                const commandDefinition = seedRandomCommand();
                CommandRegistry.registerAlias(commandDefinition);
                // First two args don't really matter
                const expectedArgv = [
                    TestUtils.randomWord(),
                    TestUtils.randomWord(),
                    `${commandDefinition.command}${TestUtils.randomWord()}`, // This is the important setup
                ];
                // Cloning to ensure we have a separate reference to work with
                process.argv = [...expectedArgv];

                // Act
                CommandRegistry.parseWithAliases();

                // Assert
                expect(programParseSpy).toHaveBeenCalledWith(expectedArgv); // The test should fail if something modifies process.argv in-place
            });
        });
    });

    // #endregion parseWithAliases

    // -----------------------------------------------------------------------------------------
    // #region registerAlias
    // -----------------------------------------------------------------------------------------

    describe("registerAlias", () => {
        describe("given command is registered", () => {
            test("when called with command name and 'overrideIfRegistered' false, it outputs a warning", () => {
                // Arrange
                const commandDefinition = seedRandomCommand();
                const { command, description } = commandDefinition;
                const overrideIfRegistered = false; // This is the important setup
                program.command(command, description);

                // Act
                CommandRegistry.registerAlias(
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

                // Act
                CommandRegistry.registerAlias(
                    commandDefinition,
                    overrideIfRegistered
                );

                // Assert
                expect(programCommandSpy).toHaveBeenCalled();
            });
        });

        describe("given command is not already registered", () => {
            test("it calls program.command", () => {
                // Arrange
                const commandDefinition = seedRandomCommand();
                const overrideIfRegistered = faker.random.boolean(); // This shouldn't matter

                // Act
                CommandRegistry.registerAlias(
                    commandDefinition,
                    overrideIfRegistered
                );

                // Assert
                expect(programCommandSpy).toHaveBeenCalled();
            });
        });
    });

    // #endregion registerAlias

    // -----------------------------------------------------------------------------------------
    // #region registerAliasesFromConfig
    // -----------------------------------------------------------------------------------------

    describe("registerAliasesFromConfig", () => {
        test("given there are no aliases in the config, it returns 'this'", () => {
            // Arrange
            jest.spyOn(
                PackageConfig,
                "getLocalAndCliConfigOrDefault"
            ).mockImplementation(() => {
                return { aliases: {} };
            });

            // Act
            const result = CommandRegistry.registerAliasesFromConfig();

            // Assert
            expect(result).toBe(CommandRegistry); // Using toBe matcher for referential equality
        });

        describe("given command is registered", () => {
            test("when called with command name and 'overrideIfRegistered' false, it outputs a warning", () => {
                // Arrange
                const { command, description } = seedRandomCommand();
                const overrideIfRegistered = false; // This is the important setup
                program.command(command, description);
                jest.spyOn(
                    PackageConfig,
                    "getLocalAndCliConfigOrDefault"
                ).mockImplementation(() => {
                    return {
                        aliases: {
                            [command]: description,
                        },
                    };
                });

                // Act
                CommandRegistry.registerAliasesFromConfig(overrideIfRegistered);

                // Assert
                expect(echoWarnSpy).toHaveBeenCalled();
            });

            test("when called with command name and 'overrideIfRegistered' true, it calls program.command again", () => {
                // Arrange
                // Variables need to be prefixed with 'mock' to be referenced in jest.mock calls
                const { command, description } = seedRandomCommand();
                const overrideIfRegistered = true; // This is the important setup
                program.command(command, description);
                jest.spyOn(
                    PackageConfig,
                    "getLocalAndCliConfigOrDefault"
                ).mockImplementation(() => {
                    return {
                        aliases: {
                            [command]: description,
                        },
                    };
                });

                // Act
                CommandRegistry.registerAliasesFromConfig(overrideIfRegistered);

                // Assert
                expect(programCommandSpy).toHaveBeenCalledTimes(2);
            });
        });

        describe("given command is not already registered", () => {
            test("it calls program.command", () => {
                // Arrange
                const { command, description } = seedRandomCommand();
                const overrideIfRegistered = faker.random.boolean(); // This shouldn't matter
                jest.spyOn(
                    PackageConfig,
                    "getLocalAndCliConfigOrDefault"
                ).mockImplementation(() => {
                    return {
                        aliases: {
                            [command]: description,
                        },
                    };
                });

                // Act
                CommandRegistry.registerAliasesFromConfig(overrideIfRegistered);

                // Assert
                expect(programCommandSpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    // #endregion registerAliasesFromConfig

    // -----------------------------------------------------------------------------------------
    // #region registerBaseCommand
    // -----------------------------------------------------------------------------------------

    describe("registerBaseCommand", () => {
        test.each([undefined, null, "", " "])(
            "when called with %p, it exits with an error",
            (name) => {
                // Arrange & Act
                CommandRegistry.registerBaseCommand(name as string);

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalledWith(1);
            }
        );

        describe("given command is not defined in commands module", () => {
            test("when called with command name, it exits with an error", () => {
                // Arrange
                const { command } = seedRandomCommand();

                // Act
                CommandRegistry.registerBaseCommand(command);

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalledWith(1);
            });
        });

        describe("given command is registered", () => {
            test("when called with command name and 'overrideIfRegistered' false, it outputs a warning", () => {
                // Arrange
                const { command, description } = faker.random.arrayElement(
                    CommandDefinitions
                );
                const overrideIfRegistered = false; // This is the important setup
                program.command(command, description);

                // Act
                CommandRegistry.registerBaseCommand(
                    command,
                    overrideIfRegistered
                );

                // Assert
                expect(echoWarnSpy).toHaveBeenCalled();
            });

            test("when called with command name and 'overrideIfRegistered' true, it calls program.command again", () => {
                // Arrange
                const { command, description } = faker.random.arrayElement(
                    CommandDefinitions
                );
                const overrideIfRegistered = true; // This is the important setup
                program.command(command, description);

                // Act
                CommandRegistry.registerBaseCommand(
                    command,
                    overrideIfRegistered
                );

                // Assert
                expect(programCommandSpy).toHaveBeenCalledTimes(2);
            });
        });

        describe("given command is not already registered", () => {
            describe("given 'isImportedModule' is initialized to true", () => {
                test(`it calls program.command with a file path pointing to ${Constants.NODE_MODULES}`, () => {
                    // Arrange
                    const { command, description } = faker.random.arrayElement(
                        CommandDefinitions
                    );
                    // The expected file path should point to the transpiled JS in the node_modules folder
                    const expectedFilePath = upath.join(
                        ".",
                        Constants.NODE_MODULES,
                        Constants.CLI_NAME,
                        Constants.DIST,
                        `${Constants.CLI_NAME}-${command}.js`
                    );
                    CommandRegistry.initialize(true); // This is the important setup

                    // Act
                    CommandRegistry.registerBaseCommand(command);

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
                        CommandDefinitions
                    );
                    // The expected file path should point to ./and-cli-{commandName}.js
                    const expectedFilePath = upath.join(
                        ".",
                        `${Constants.CLI_NAME}-${command}.js`
                    );
                    CommandRegistry.initialize(false); // This is the important setup

                    // Act
                    CommandRegistry.registerBaseCommand(command);

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
            // Arrange & Act
            CommandRegistry.registerBaseCommands();

            // Assert
            expect(programCommandSpy).toHaveBeenCalledTimes(
                CommandDefinitions.length
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

                // Act
                CommandRegistry.registerCommand(
                    commandDefinition,
                    overrideIfRegistered
                );

                // Assert
                expect(echoWarnSpy).toHaveBeenCalled();
            });

            test("when called with command name and 'overrideIfRegistered' true, it calls program.command again", () => {
                // Arrange
                const commandDefinition = seedRandomCommand();
                const { command, description } = commandDefinition;
                const overrideIfRegistered = true; // This is the important setup
                program.command(command, description);

                // Act
                CommandRegistry.registerCommand(
                    commandDefinition,
                    overrideIfRegistered
                );

                // Assert
                expect(programCommandSpy).toHaveBeenCalledTimes(2);
            });
        });

        describe("given command is not already registered", () => {
            test("it calls program.command", () => {
                // Arrange
                const commandDefinition = seedRandomCommand();
                const { command, description } = commandDefinition;
                const overrideIfRegistered = faker.random.boolean(); // This shouldn't matter

                // Act
                CommandRegistry.registerCommand(
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
        test.each<undefined | null | any[]>([undefined, null, []])(
            "when called with a commands array value of %p, it does not call registerCommand",
            (commands) => {
                // Arrange
                const registerCommandSpy = jest.spyOn(
                    CommandRegistry,
                    "registerCommand"
                );

                // Act
                CommandRegistry.registerCommands(
                    commands as CommandDefinition[]
                );

                // Assert
                expect(registerCommandSpy).not.toHaveBeenCalled();
            }
        );

        test("when commands array has values, it calls registerCommand for each command", () => {
            // Arrange
            const commandCount = TestUtils.randomNumber(1, 10);
            const commands = [];
            for (let i = 0; i < commandCount; i++) {
                commands.push(seedRandomCommand());
            }

            // Act
            CommandRegistry.registerCommands(commands);

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
                CommandRegistry.removeCommand(value as string);

                // Assert
                expect(program.commands).toBe(expectedCommands); // Using toBe matcher for referential equality
            }
        );

        test("when called with command that does not exist, it does not modify commands array", () => {
            // Arrange
            const { command } = seedRandomCommand();
            const expectedCommands = program.commands;

            // Act
            CommandRegistry.removeCommand(command);

            // Assert
            expect(program.commands).toStrictEqual(expectedCommands);
        });

        test("when called with command that exists, it returns a new command array without that command", () => {
            // Arrange
            const { command, description } = seedRandomCommand();
            program.command(command, description);
            const expectedCommands: program.Command[] = [];

            // Act
            CommandRegistry.removeCommand(command);

            // Assert
            expect(program.commands).toStrictEqual(expectedCommands);
        });
    });

    // #endregion removeCommand
});

// #endregion Tests
