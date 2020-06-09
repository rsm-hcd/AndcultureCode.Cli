// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const {
    ERROR_OUTPUT_STRING,
    HELP_OPTIONS
} = require("./_modules/constants");
const testUtils = require("./tests/test-utils");
const child_process = require("child_process");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("cli-dotnet", () => {
    let _tmpDir;
    let _cleanupTmpDir = () => { };
    beforeEach(() => {
        // Verify that dotnet is installed before continuing.
        testUtils.verifyDotnetPath();

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
    // #region -b, --build
    // -----------------------------------------------------------------------------------------

    describe("-b, --build", () => {
        test.each`
            option
            ${"-b"}
            ${"--build"}
        `("when passed '$option' and no solution can be found, it displays an error", async ({ option }) => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand("dotnet", [option]);

            // Assert
            expect(result).toContain(ERROR_OUTPUT_STRING);
        });

        test.each`
            option
            ${"-b"}
            ${"--build"}
        `("when passed '$option' and solution exists, it performs a build", async ({ option }) => {
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

    // #endregion -b, --build

    // -----------------------------------------------------------------------------------------
    // #region -h, --help
    // -----------------------------------------------------------------------------------------

    describe(HELP_OPTIONS, () => {
        test.each`
            option
            ${"-h"}
            ${"--help"}
        `("when passed '$option', it displays the help menu", async ({ option }) => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand("dotnet", [option]);

            // Assert
            expect(result).toContain(HELP_OPTIONS);
        });
    });

    // #endregion -h, --help
});

// #endregion Tests
