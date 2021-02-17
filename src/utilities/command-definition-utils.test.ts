import { CommandDefinitions } from "../modules/command-definitions";
import { CommandDefinitionUtils } from "./command-definition-utils";
import faker from "faker";
import { Factory } from "rosie";
import { CommandDefinition } from "../interfaces/command-definition";
import { FactoryType } from "../tests/factories/factory-type";

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("CommandDefinitionUtils", () => {
    // Importing a fresh copy of the module in each test to clear out local state between tests
    let sut: typeof CommandDefinitionUtils;
    beforeEach(() => {
        jest.isolateModules(() => {
            sut = require("./command-definition-utils").CommandDefinitionUtils;
        });
    });

    // -----------------------------------------------------------------------------------------
    // #region exists
    // -----------------------------------------------------------------------------------------

    describe("exists", () => {
        describe("when default map", () => {
            test("when definition exists, it returns true", () => {
                // Arrange
                // Default map should be the CommandDefinitions module
                const { command: name } = CommandDefinitions.dotnet;

                // Act
                const result = sut.exists(name);

                // Assert
                expect(result).toBeTrue();
            });

            test("when definition does not exist, it returns false", () => {
                // Arrange
                const name = faker.random.uuid();

                // Act
                const result = sut.exists(name);

                // Assert
                expect(result).toBeFalse();
            });
        });

        describe("when map provided", () => {
            test("when definition exists, it returns true", () => {
                // Arrange
                const definition = Factory.build<CommandDefinition>(
                    FactoryType.CommandDefinition
                );
                const { command: name } = definition;
                const map = { [name]: definition };

                // Act
                const result = sut.exists(name, map);

                // Assert
                expect(result).toBeTrue();
            });

            test("when definition does not exist, it returns false", () => {
                // Arrange
                const name = faker.random.uuid();
                const map = {};

                // Act
                const result = CommandDefinitionUtils.exists(name, map);

                // Assert
                expect(result).toBeFalse();
            });
        });
    });

    // #endregion exists

    // -----------------------------------------------------------------------------------------
    // #region flatten
    // -----------------------------------------------------------------------------------------

    describe("flatten", () => {
        test.todo(
            "TODO - https://github.com/AndcultureCode/AndcultureCode.Cli/issues/155"
        );
    });

    // #endregion flatten

    // -----------------------------------------------------------------------------------------
    // #region get
    // -----------------------------------------------------------------------------------------

    describe("get", () => {
        test.todo(
            "TODO - https://github.com/AndcultureCode/AndcultureCode.Cli/issues/155"
        );
    });

    // #endregion get

    // -----------------------------------------------------------------------------------------
    // #region getNames
    // -----------------------------------------------------------------------------------------

    describe("getNames", () => {
        test.todo(
            "TODO - https://github.com/AndcultureCode/AndcultureCode.Cli/issues/155"
        );
    });

    // #endregion getNames

    // -----------------------------------------------------------------------------------------
    // #region isBase
    // -----------------------------------------------------------------------------------------

    describe("isBase", () => {
        test.todo(
            "TODO - https://github.com/AndcultureCode/AndcultureCode.Cli/issues/155"
        );
    });

    // #endregion isBase

    // -----------------------------------------------------------------------------------------
    // #region setDefault
    // -----------------------------------------------------------------------------------------

    describe("setDefault", () => {
        test("before calling, default value should be CommandDefinitions", () => {
            // Arrange
            const names = sut.getNames();

            // Act & Assert
            names.forEach((name: string) =>
                expect(sut.exists(name)).toBeTrue()
            );
        });

        test("it sets default map value", () => {
            // Arrange
            const map: Record<string, CommandDefinition> = {
                command1: Factory.build<CommandDefinition>(
                    FactoryType.CommandDefinition
                ),
                command2: Factory.build<CommandDefinition>(
                    FactoryType.CommandDefinition
                ),
            };

            // Act
            sut.setDefault(map);

            // Assert
            expect(sut.exists(map.command1.command)).toBeTrue();
            expect(sut.exists(map.command2.command)).toBeTrue();
        });
    });

    // #endregion setDefault

    // -----------------------------------------------------------------------------------------
    // #region toCsv
    // -----------------------------------------------------------------------------------------

    describe("toCsv", () => {
        test.todo(
            "TODO - https://github.com/AndcultureCode/AndcultureCode.Cli/issues/155"
        );
    });

    // #endregion toCsv
});

// #endregion Tests
