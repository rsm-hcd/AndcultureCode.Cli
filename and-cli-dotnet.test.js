// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const {
    givenOptions,
    shouldDisplayError,
    shouldDisplayHelpMenu,
    withTemporaryDirectory,
} = require("./tests/shared-specs");
const { dotnet } = require("./modules/commands");
const dotnetBuild = require("./modules/dotnet-build");
const dotnetPath = require("./modules/dotnet-path");
const testUtils = require("./tests/test-utils");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const COMMAND = dotnet.command;

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("and-cli-dotnet", () => {
    // -----------------------------------------------------------------------------------------
    // #region Setup
    // -----------------------------------------------------------------------------------------

    withTemporaryDirectory(COMMAND, () => {
        dotnetPath.verifyOrExit();
    });

    // #endregion Setup

    // -----------------------------------------------------------------------------------------
    // #region build
    // -----------------------------------------------------------------------------------------

    givenOptions(dotnetBuild.getOptions().toArray(), (option) => {
        describe("when no solution can be found", () =>
            shouldDisplayError(
                async () =>
                    // Arrange & Act
                    await testUtils.executeCliCommand(COMMAND, [option])
            ));

        describe("when solution exists", () => {
            test("it performs a build", async () => {
                // Arrange
                testUtils.createDotnetSolution();
                testUtils.createDotnetConsoleApp();
                testUtils.addDotnetProject();

                // Act
                const result = await testUtils.executeCliCommand(COMMAND, [
                    option,
                ]);

                // Assert
                expect(result).toContain("Build succeeded.");
            });
        });
    });

    // #endregion build

    // -----------------------------------------------------------------------------------------
    // #region help
    // -----------------------------------------------------------------------------------------

    shouldDisplayHelpMenu("dotnet");

    // #endregion help
});

// #endregion Tests
