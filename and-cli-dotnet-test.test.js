// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const { dotnetTest } = require("./modules/commands");
const {
    shouldDisplayError,
    shouldDisplayHelpMenu,
    withTemporaryDirectory,
} = require("./tests/shared-specs");
const dotnetPath = require("./modules/dotnet-path");
const dotnetTestModule = require("./modules/dotnet-test");
const testUtils = require("./tests/test-utils");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const COMMAND = dotnetTest.command;
const OPTIONS = dotnetTestModule.getOptions();
const TEST_RUN_SUCCESSFUL_REGEXP = /Test Run Successful/g;

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("and-cli-dotnet-test", () => {
    // -----------------------------------------------------------------------------------------
    // #region Setup
    // -----------------------------------------------------------------------------------------

    withTemporaryDirectory(COMMAND, () => {
        dotnetPath.verifyOrExit();
    });

    // #endregion Setup

    // -----------------------------------------------------------------------------------------
    // #region Run by project
    // -----------------------------------------------------------------------------------------

    describe("Run by project", () => {
        describe("when no solution can be found", () =>
            shouldDisplayError(
                async () =>
                    // Arrange & Act
                    await testUtils.executeCliCommand(COMMAND, [
                        OPTIONS.BY_PROJECT,
                    ])
            ));

        describe("when solution exists", () => {
            test("given a passing test suite, it prints success message", async () => {
                // Arrange
                testUtils.createDotnetSolution();
                testUtils.createDotnetXUnitProject("Project.Test");
                testUtils.addDotnetProject();

                // Act
                const result = await testUtils.executeCliCommand(COMMAND, [
                    OPTIONS.BY_PROJECT,
                ]);

                // Assert
                expect(result).toMatch(TEST_RUN_SUCCESSFUL_REGEXP);
            });

            test("given a solution with multiple projects, it runs each project individually", async () => {
                // Arrange
                testUtils.createDotnetSolution();
                testUtils.createDotnetXUnitProject("Project1.Test");
                testUtils.createDotnetXUnitProject("Project2.Test");
                testUtils.addDotnetProject();

                // Act
                const result = await testUtils.executeCliCommand(COMMAND, [
                    OPTIONS.BY_PROJECT,
                ]);

                // Assert
                expect(result.match(TEST_RUN_SUCCESSFUL_REGEXP)).toHaveLength(
                    2
                );
            });
        });
    });

    // #endregion Run by project

    // -----------------------------------------------------------------------------------------
    // #region Run by solution
    // -----------------------------------------------------------------------------------------

    describe("Run by solution", () => {
        describe("when no solution can be found", () =>
            shouldDisplayError(
                async () =>
                    // Arrange & Act
                    await testUtils.executeCliCommand(COMMAND)
            ));

        describe("when solution exists", () => {
            test("given a passing test suite, it prints success message", async () => {
                // Arrange
                testUtils.createDotnetSolution();
                testUtils.createDotnetXUnitProject();
                testUtils.addDotnetProject();

                // Act
                const result = await testUtils.executeCliCommand(COMMAND);

                // Assert
                expect(result).toMatch(TEST_RUN_SUCCESSFUL_REGEXP);
            });
        });
    });

    // #endregion Run by solution

    // -----------------------------------------------------------------------------------------
    // #region help
    // -----------------------------------------------------------------------------------------

    shouldDisplayHelpMenu("dotnet-test");

    // #endregion help
});

// #endregion Tests
