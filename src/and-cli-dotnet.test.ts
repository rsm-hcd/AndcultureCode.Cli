import { CommandDefinitions } from "./modules/command-definitions";
import {
    givenOptions,
    shouldDisplayError,
    shouldDisplayHelpMenu,
    withTemporaryDirectory,
} from "./tests/shared-specs";
import { DotnetPath } from "./modules/dotnet-path";
import { TestUtils } from "./tests/test-utils";
import { DotnetBuild } from "./modules/dotnet-build";

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const COMMAND = CommandDefinitions.dotnet.command;

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("and-cli-dotnet", () => {
    // -----------------------------------------------------------------------------------------
    // #region Setup
    // -----------------------------------------------------------------------------------------

    withTemporaryDirectory(COMMAND, () => {
        DotnetPath.verifyOrExit();
    });

    // #endregion Setup

    // -----------------------------------------------------------------------------------------
    // #region build
    // -----------------------------------------------------------------------------------------

    givenOptions(DotnetBuild.getOptions().toArray(), (option: string) => {
        describe("when no solution can be found", () =>
            shouldDisplayError(
                async () =>
                    // Arrange & Act
                    await TestUtils.executeCliCommand(COMMAND, [option])
            ));

        describe("when solution exists", () => {
            test("it performs a build", async () => {
                // Arrange
                TestUtils.createDotnetSolution();
                TestUtils.createDotnetConsoleApp();
                TestUtils.addDotnetProject();

                // Act
                const result = await TestUtils.executeCliCommand(COMMAND, [
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
