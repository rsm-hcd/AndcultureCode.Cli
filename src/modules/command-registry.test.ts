import { CommandDefinition } from "../interfaces/command-definition";
import { CommandDefinitions } from "./command-definitions";
import { Echo } from "./echo";
import program from "commander";
import { CommandRegistry } from "./command-registry";
import { PackageConfig } from "./package-config";
import { Constants } from "./constants";
import faker from "faker";
import { TestUtils } from "../tests/test-utils";
import upath from "upath";
import { CommandDefinitionUtils } from "../utilities/command-definition-utils";
import { Factory } from "rosie";
import { FactoryType } from "../tests/factories/factory-type";

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const FLATTENED_COMMAND_DEFINITIONS = CommandDefinitionUtils.flatten(
    CommandDefinitions
);

// #endregion Constants

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

    // Importing a fresh copy of the CommandRegistry in each test to clear out local state between tests
    let sut: typeof CommandRegistry;

    beforeEach(() => {
        // In order to prevent test flakiness due to runtime order, we need to clear out
        // the cached program instance command array. Each test should have the appropriate setup steps
        // to configure the program commands, if needed.
        program.commands = [];

        echoErrorSpy = jest.spyOn(Echo, "error");
        echoWarnSpy = jest.spyOn(Echo, "warn");
        programCommandSpy = jest.spyOn(program, "command");
        shellExitSpy = TestUtils.spyOnShellExit();

        jest.isolateModules(() => {
            sut = require("./command-registry").CommandRegistry;
        });
    });

    // #endregion Setup

    // -----------------------------------------------------------------------------------------
    // #region clear
    // -----------------------------------------------------------------------------------------

    describe("clear", () => {
        test("it assigns the program.commands array to an empty array", () => {
            // Arrange
            const { command, description } = Factory.build<CommandDefinition>(
                FactoryType.CommandDefinition
            );
            program.command(command, description);

            // Act
            sut.clear();

            // Assert
            expect(program.commands).toStrictEqual([]);
        });
    });

    // #endregion clear

    // -----------------------------------------------------------------------------------------
    // #region configure
    // -----------------------------------------------------------------------------------------

    describe("configure", () => {
        test("it returns 'this'", () => {
            // Arrange
            const expected = sut;

            // Act
            const result = sut.configure({
                isImportedModule: faker.random.boolean(),
            });

            // Assert
            expect(result).toBe(expected);
        });

        describe("given configure has been called with 'isImportedModule' value", () => {
            test("when called with different value for 'isImportedModule', it exits with an error", () => {
                // Arrange
                const isImportedModule = faker.random.boolean();
                sut.configure({ isImportedModule });

                // Act
                sut.configure({
                    isImportedModule: !isImportedModule,
                });

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalledWith(1);
            });

            test("when called with no value for 'isImportedModule', it does not exit", () => {
                // Arrange
                const isImportedModule = faker.random.boolean();
                sut.configure({ isImportedModule });

                // Act
                sut.configure({});

                // Assert
                expect(echoErrorSpy).not.toHaveBeenCalled();
                expect(shellExitSpy).not.toHaveBeenCalled();
            });

            test("when called with same value for 'isImportedModule', it does not exit", () => {
                // Arrange
                const isImportedModule = faker.random.boolean();
                sut.configure({ isImportedModule });

                // Act
                sut.configure({ isImportedModule });

                // Assert
                expect(echoErrorSpy).not.toHaveBeenCalled();
                expect(shellExitSpy).not.toHaveBeenCalled();
            });
        });
    });

    // #endregion configure

    // -----------------------------------------------------------------------------------------
    // #region get
    // -----------------------------------------------------------------------------------------

    describe("get", () => {
        test.each([undefined, null, "", " "])(
            "when called with %p, it returns undefined",
            (name) => {
                // Arrange & Act
                const result = sut.get((name as any) as string);

                // Assert
                expect(result).toBeUndefined();
            }
        );

        describe("given the command is not registered", () => {
            test("when called with the command name, it returns undefined", () => {
                // Arrange
                const { command } = Factory.build<CommandDefinition>(
                    FactoryType.CommandDefinition
                );

                // Act
                const result = sut.get(command);

                // Assert
                expect(result).toBeUndefined();
            });
        });

        describe("given a command is registered", () => {
            test("when called with that name, it returns the specified command", () => {
                // Arrange
                const { command, description } = Factory.build<
                    CommandDefinition
                >(FactoryType.CommandDefinition);
                program.command(command, description);

                // Act
                const result = sut.get(command);

                // Assert
                expect(result).not.toBeNull();
                expect(result!.name()).toBe(command);
            });

            test("when called with that name in any casing, it returns the specified command", () => {
                // Arrange
                const { command, description } = Factory.build<
                    CommandDefinition
                >(FactoryType.CommandDefinition);
                const randomCaseName = TestUtils.randomCase(command);
                program.command(command, description);

                // Act
                const result = sut.get(randomCaseName);

                // Assert
                expect(result).not.toBeNull();
                expect(result!.name()).toBe(command);
            });
        });
    });

    // #endregion get

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
                sut.parseWithAliases();

                // Assert
                expect(programParseSpy).toHaveBeenCalledWith(expectedArgv); // The test should fail if something modifies process.argv in-place
            });
        });

        describe("given at least one alias is registered", () => {
            test("when < 3 args are provided, it calls program.parse with process.argv", () => {
                // Arrange
                const commandDefinition = Factory.build<CommandDefinition>(
                    FactoryType.CommandDefinition
                );
                sut.registerAlias(commandDefinition);
                const expectedArgv = [];

                // This is the important setup
                const argvCount = TestUtils.randomNumber(0, 2);
                for (let i = 0; i < argvCount; i++) {
                    expectedArgv.push(TestUtils.randomWord());
                }

                // Cloning to ensure we have a separate reference to work with
                process.argv = [...expectedArgv];

                // Act
                sut.parseWithAliases();

                // Assert
                expect(programParseSpy).toHaveBeenCalledWith(expectedArgv); // The test should fail if something modifies process.argv in-place
            });

            test("when > 3 args are provided, it calls program.parse with process.argv", () => {
                // Arrange
                const commandDefinition = Factory.build<CommandDefinition>(
                    FactoryType.CommandDefinition
                );
                sut.registerAlias(commandDefinition);
                const expectedArgv = [];

                // This is the important setup
                const argvCount = TestUtils.randomNumber(4, 100);
                for (let i = 0; i < argvCount; i++) {
                    expectedArgv.push(TestUtils.randomWord());
                }

                // Cloning to ensure we have a separate reference to work with
                process.argv = [...expectedArgv];

                // Act
                sut.parseWithAliases();

                // Assert
                expect(programParseSpy).toHaveBeenCalledWith(expectedArgv); // The test should fail if something modifies process.argv in-place
            });

            test("when 3rd arg matching an alias provided, it calls program.parse with transformed args", () => {
                // Arrange
                const commandDefinition = Factory.build<CommandDefinition>(
                    FactoryType.CommandDefinition
                );
                const { command: alias } = commandDefinition;
                const transformedCommand = commandDefinition.description.split(
                    " "
                );
                sut.registerAlias(commandDefinition);
                // First two args don't really matter
                process.argv = [
                    TestUtils.randomWord(),
                    TestUtils.randomWord(),
                    alias, // This is the important setup
                ];

                // Act
                sut.parseWithAliases();

                // Assert
                expect(programParseSpy).toHaveBeenCalledWith(
                    transformedCommand,
                    { from: "user" }
                );
            });

            test("when 3rd arg does not match any alias, it calls program.parse with process.argv", () => {
                // Arrange
                const commandDefinition = Factory.build<CommandDefinition>(
                    FactoryType.CommandDefinition
                );
                sut.registerAlias(commandDefinition);
                // First two args don't really matter
                const expectedArgv = [
                    TestUtils.randomWord(),
                    TestUtils.randomWord(),
                    `${commandDefinition.command}${TestUtils.randomWord()}`, // This is the important setup
                ];
                // Cloning to ensure we have a separate reference to work with
                process.argv = [...expectedArgv];

                // Act
                sut.parseWithAliases();

                // Assert
                expect(programParseSpy).toHaveBeenCalledWith(expectedArgv); // The test should fail if something modifies process.argv in-place
            });
        });
    });

    // #endregion parseWithAliases

    // -----------------------------------------------------------------------------------------
    // #region register
    // -----------------------------------------------------------------------------------------

    describe("register", () => {
        describe("given command is registered", () => {
            test("when called with command name and 'overrideIfRegistered' false, it outputs a warning", () => {
                // Arrange
                const commandDefinition = Factory.build<CommandDefinition>(
                    FactoryType.CommandDefinition
                );
                const { command, description } = commandDefinition;
                const overrideIfRegistered = false; // This is the important setup
                program.command(command, description);

                // Act
                sut.register(commandDefinition, overrideIfRegistered);

                // Assert
                expect(echoWarnSpy).toHaveBeenCalled();
            });

            test("when called with command name and 'overrideIfRegistered' true, it calls program.command again", () => {
                // Arrange
                const commandDefinition = Factory.build<CommandDefinition>(
                    FactoryType.CommandDefinition
                );
                const { command, description } = commandDefinition;
                const overrideIfRegistered = true; // This is the important setup
                program.command(command, description);

                // Act
                sut.register(commandDefinition, overrideIfRegistered);

                // Assert
                expect(programCommandSpy).toHaveBeenCalledTimes(2);
            });
        });

        describe("given command is not already registered", () => {
            test("it calls program.command", () => {
                // Arrange
                const commandDefinition = Factory.build<CommandDefinition>(
                    FactoryType.CommandDefinition
                );
                const { command, description } = commandDefinition;
                const overrideIfRegistered = faker.random.boolean(); // This shouldn't matter

                // Act
                sut.register(commandDefinition, overrideIfRegistered);

                // Assert
                expect(programCommandSpy).toHaveBeenCalledWith(
                    command,
                    description
                );
            });
        });
    });

    // #endregion register

    // -----------------------------------------------------------------------------------------
    // #region registerAlias
    // -----------------------------------------------------------------------------------------

    describe("registerAlias", () => {
        describe("given command is registered", () => {
            test("when called with command name and 'overrideIfRegistered' false, it outputs a warning", () => {
                // Arrange
                const commandDefinition = Factory.build<CommandDefinition>(
                    FactoryType.CommandDefinition
                );
                const { command, description } = commandDefinition;
                const overrideIfRegistered = false; // This is the important setup
                program.command(command, description);

                // Act
                sut.registerAlias(commandDefinition, overrideIfRegistered);

                // Assert
                expect(echoWarnSpy).toHaveBeenCalled();
            });

            test("when called with command name and 'overrideIfRegistered' true, it calls program.command", () => {
                // Arrange
                const commandDefinition = Factory.build<CommandDefinition>(
                    FactoryType.CommandDefinition
                );
                const { command, description } = commandDefinition;
                const overrideIfRegistered = true; // This is the important setup
                program.command(command, description);

                // Act
                sut.registerAlias(commandDefinition, overrideIfRegistered);

                // Assert
                expect(programCommandSpy).toHaveBeenCalled();
            });
        });

        describe("given command is not already registered", () => {
            test("it calls program.command", () => {
                // Arrange
                const commandDefinition = Factory.build<CommandDefinition>(
                    FactoryType.CommandDefinition
                );
                const overrideIfRegistered = faker.random.boolean(); // This shouldn't matter

                // Act
                sut.registerAlias(commandDefinition, overrideIfRegistered);

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
            const result = sut.registerAliasesFromConfig();

            // Assert
            expect(result).toBe(sut); // Using toBe matcher for referential equality
        });

        describe("given command is registered", () => {
            test("when called with command name and 'overrideIfRegistered' false, it outputs a warning", () => {
                // Arrange
                const { command, description } = Factory.build<
                    CommandDefinition
                >(FactoryType.CommandDefinition);
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
                sut.registerAliasesFromConfig(overrideIfRegistered);

                // Assert
                expect(echoWarnSpy).toHaveBeenCalled();
            });

            test("when called with command name and 'overrideIfRegistered' true, it calls program.command again", () => {
                // Arrange
                // Variables need to be prefixed with 'mock' to be referenced in jest.mock calls
                const { command, description } = Factory.build<
                    CommandDefinition
                >(FactoryType.CommandDefinition);
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
                sut.registerAliasesFromConfig(overrideIfRegistered);

                // Assert
                expect(programCommandSpy).toHaveBeenCalledTimes(2);
            });
        });

        describe("given command is not already registered", () => {
            test("it calls program.command", () => {
                // Arrange
                const { command, description } = Factory.build<
                    CommandDefinition
                >(FactoryType.CommandDefinition);
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
                sut.registerAliasesFromConfig(overrideIfRegistered);

                // Assert
                expect(programCommandSpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    // #endregion registerAliasesFromConfig

    // -----------------------------------------------------------------------------------------
    // #region registerAll
    // -----------------------------------------------------------------------------------------

    describe("registerAll", () => {
        test("when value is an empty array, it does not call register", () => {
            // Arrange
            const registerCommandSpy = jest.spyOn(sut, "register");

            // Act
            sut.registerAll([]);

            // Assert
            expect(registerCommandSpy).not.toHaveBeenCalled();
        });

        test("when value is an empty object, it does not call register", () => {
            // Arrange
            const registerCommandSpy = jest.spyOn(sut, "register");

            // Act
            sut.registerAll({});

            // Assert
            expect(registerCommandSpy).not.toHaveBeenCalled();
        });

        test("when value is an array with definitions, it calls 'register' for each definition", () => {
            // Arrange
            const expected = TestUtils.randomNumber(2, 10);
            const definitions = Factory.buildList<CommandDefinition>(
                FactoryType.CommandDefinition,
                expected
            );

            // Act
            sut.registerAll(definitions);

            // Assert
            expect(programCommandSpy).toHaveBeenCalledTimes(expected);
        });

        test("when value is a map with definitions, it calls 'register' for each definition", () => {
            // Arrange
            const definitions: Record<string, CommandDefinition> = {
                command1: Factory.build<CommandDefinition>(
                    FactoryType.CommandDefinition
                ),
                command2: Factory.build<CommandDefinition>(
                    FactoryType.CommandDefinition
                ),
            };
            const expected = Object.keys(definitions).length;

            // Act
            sut.registerAll(definitions);

            // Assert
            expect(programCommandSpy).toHaveBeenCalledTimes(expected);
        });
    });

    // #endregion registerAll

    // -----------------------------------------------------------------------------------------
    // #region registerAllBase
    // -----------------------------------------------------------------------------------------

    describe("registerAllBase", () => {
        test("it calls registerBase for each base command", () => {
            // Arrange & Act
            sut.registerAllBase();

            // Assert
            expect(programCommandSpy).toHaveBeenCalledTimes(
                FLATTENED_COMMAND_DEFINITIONS.length
            );
        });
    });

    // #endregion registerAllBase

    // -----------------------------------------------------------------------------------------
    // #region registerBase
    // -----------------------------------------------------------------------------------------

    describe("registerBase", () => {
        test.each([undefined, null, "", " "])(
            "when called with %p, it exits with an error",
            (name) => {
                // Arrange & Act
                sut.registerBase(name as string);

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalledWith(1);
            }
        );

        describe("given command is not defined in commands module", () => {
            test("when called with command name, it exits with an error", () => {
                // Arrange
                const { command } = Factory.build<CommandDefinition>(
                    FactoryType.CommandDefinition
                );

                // Act
                sut.registerBase(command);

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalledWith(1);
            });
        });

        describe("given command is registered", () => {
            test("when called with command name and 'overrideIfRegistered' false, it outputs a warning", () => {
                // Arrange
                const { command, description } = faker.random.arrayElement(
                    FLATTENED_COMMAND_DEFINITIONS
                );
                const overrideIfRegistered = false; // This is the important setup
                program.command(command, description);

                // Act
                sut.registerBase(command, overrideIfRegistered);

                // Assert
                expect(echoWarnSpy).toHaveBeenCalled();
            });

            test("when called with command name and 'overrideIfRegistered' true, it calls program.command again", () => {
                // Arrange
                const { command, description } = faker.random.arrayElement(
                    FLATTENED_COMMAND_DEFINITIONS
                );
                const overrideIfRegistered = true; // This is the important setup
                program.command(command, description);

                // Act
                sut.registerBase(command, overrideIfRegistered);

                // Assert
                expect(programCommandSpy).toHaveBeenCalledTimes(2);
            });
        });

        describe("given command is not already registered", () => {
            describe("given 'isImportedModule' is set to true", () => {
                test(`it calls program.command with a file path pointing to ${Constants.NODE_MODULES}`, () => {
                    // Arrange
                    const { command, description } = faker.random.arrayElement(
                        FLATTENED_COMMAND_DEFINITIONS
                    );
                    // The expected file path should point to the transpiled JS in the node_modules folder
                    const expectedFilePath = upath.join(
                        ".",
                        Constants.NODE_MODULES,
                        Constants.CLI_NAME,
                        Constants.DIST,
                        `${Constants.CLI_NAME}-${command}.js`
                    );
                    sut.configure({
                        isImportedModule: true,
                    }); // This is the important setup

                    // Act
                    sut.registerBase(command);

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

            describe("given 'isImportedModule' is set to false", () => {
                test(`it calls program.command with a file path pointing to current directory`, () => {
                    // Arrange
                    const { command, description } = faker.random.arrayElement(
                        FLATTENED_COMMAND_DEFINITIONS
                    );
                    // The expected file path should point to ./and-cli-{commandName}.js
                    const expectedFilePath = upath.join(
                        ".",
                        `${Constants.CLI_NAME}-${command}.js`
                    );
                    sut.configure({
                        isImportedModule: false,
                    }); // This is the important setup

                    // Act
                    sut.registerBase(command);

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

    // #endregion registerBase

    // -----------------------------------------------------------------------------------------
    // #region remove
    // -----------------------------------------------------------------------------------------

    describe("remove", () => {
        test.each([undefined, null, "", " "])(
            "when called with %p, it does create new commands array",
            (value) => {
                // Arrange
                // Save a reference to the original array to ensure we are creating a new one
                const expectedCommands = program.commands;

                // Act
                sut.remove(value as string);

                // Assert
                expect(program.commands).toBe(expectedCommands); // Using toBe matcher for referential equality
            }
        );

        test("when called with command that does not exist, it does not modify commands array", () => {
            // Arrange
            const { command } = Factory.build<CommandDefinition>(
                FactoryType.CommandDefinition
            );
            const expectedCommands = program.commands;

            // Act
            sut.remove(command);

            // Assert
            expect(program.commands).toStrictEqual(expectedCommands);
        });

        test("when called with command that exists, it returns a new command array without that command", () => {
            // Arrange
            const { command, description } = Factory.build<CommandDefinition>(
                FactoryType.CommandDefinition
            );
            program.command(command, description);
            const expectedCommands: program.Command[] = [];

            // Act
            sut.remove(command);

            // Assert
            expect(program.commands).toStrictEqual(expectedCommands);
        });
    });

    // #endregion remove
});

// #endregion Tests
