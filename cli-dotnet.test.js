// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const testUtils = require("./tests/test-utils");
const {
    givenOptions,
    shouldDisplayError,
    shouldDisplayHelpMenu,
} = require("./tests/describes");
const dotnetBuild = require("./_modules/dotnet-build");
const dotnetPath = require("./_modules/dotnet-path");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("cli-dotnet", () => {
    let _tmpDir;
    let _cleanupTmpDir = () => { };
    beforeEach(() => {
        // Verify that dotnet is installed before continuing.
        dotnetPath.verifyOrExit();

        // Before each test, create a temporary directory for the test to work with. We can muck around
        // for lifetime of the test and it will be cleaned up in the 'afterEach' hook.
        const { tmpDir, cleanupTmpDir } = testUtils.createAndUseTmpDir("cli-dotnet");
        _tmpDir = tmpDir;
        _cleanupTmpDir = cleanupTmpDir;
    });

    afterEach(() => {
        // Remove the temporary directory and return to whence we came.
        _cleanupTmpDir();
    });

    // -----------------------------------------------------------------------------------------
    // #region build
    // -----------------------------------------------------------------------------------------

    givenOptions(dotnetBuild.options(), (option) => {
        describe("given no solution can be found", () =>
            shouldDisplayError(async () =>
                // Arrange & Act
                await testUtils.executeCliCommand("dotnet", [option])
            )
        );

        describe("given solution exists", () => {
            test("it performs a build", async () => {
                // Arrange
                // Note: We may want to consider pulling this out into test-utils for the other parent-level
                // dotnet commands to leverage for integration testing cleans, restores, tests, etc.
                // For now, we can leave it here.
                testUtils.executeOrThrow("dotnet", ["new", "solution"]); // Create the solution file
                testUtils.executeOrThrow("dotnet", ["new", "console"]);  // Create a console app project
                testUtils.executeOrThrow("dotnet", ["sln", "add", "."]); // Add the console app project to the solution

                // Act
                const result = await testUtils.executeCliCommand("dotnet", [option]);

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
