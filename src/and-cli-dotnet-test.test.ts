import { Commands } from "./modules/commands";
import {
    shouldDisplayError,
    shouldDisplayHelpMenu,
    withTemporaryDirectory,
} from "./tests/shared-specs";
import { DotnetPath } from "./modules/dotnet-path";
import { TestUtils } from "./tests/test-utils";
import { DotnetTest } from "./modules/dotnet-test";

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const COMMAND = Commands.dotnetTest.command;
const OPTIONS = DotnetTest.getOptions();
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
        DotnetPath.verifyOrExit();
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
                    await TestUtils.executeCliCommand(COMMAND, [
                        OPTIONS.BY_PROJECT.toString(),
                    ])
            ));

        describe("when solution exists", () => {
            test("given a passing test suite, it prints success message", async () => {
                // Arrange
                TestUtils.createDotnetSolution();
                TestUtils.createDotnetXUnitProject("Project.Test");
                TestUtils.addDotnetProject();

                // Act
                const result = await TestUtils.executeCliCommand(COMMAND, [
                    OPTIONS.BY_PROJECT.toString(),
                ]);

                // Assert
                expect(result).toMatch(TEST_RUN_SUCCESSFUL_REGEXP);
            });

            test("given a solution with multiple projects, it runs each project individually", async () => {
                // Arrange
                TestUtils.createDotnetSolution();
                TestUtils.createDotnetXUnitProject("Project1.Test");
                TestUtils.createDotnetXUnitProject("Project2.Test");
                TestUtils.addDotnetProject();

                // Act
                const result = await TestUtils.executeCliCommand(COMMAND, [
                    OPTIONS.BY_PROJECT.toString(),
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
                    await TestUtils.executeCliCommand(COMMAND)
            ));

        describe("when solution exists", () => {
            test("given a passing test suite, it prints success message", async () => {
                // Arrange
                TestUtils.createDotnetSolution();
                TestUtils.createDotnetXUnitProject();
                TestUtils.addDotnetProject();

                // Act
                const result = await TestUtils.executeCliCommand(COMMAND);

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
