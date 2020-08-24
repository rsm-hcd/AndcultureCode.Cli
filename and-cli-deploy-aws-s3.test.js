// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const { ERROR_OUTPUT_STRING } = require("./_modules/constants");
const { shouldDisplayHelpMenu } = require("./tests/describes");
const testUtils = require("./tests/test-utils");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("and-cli-deploy-aws-s3", () => {
    // -----------------------------------------------------------------------------------------
    // #region destination
    // -----------------------------------------------------------------------------------------

    describe("destination", () => {
        test("given no '--destination' flag, it displays an error", async () => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand("deploy", [
                "aws-s3",
            ]);

            // Assert
            expect(result).toContain(ERROR_OUTPUT_STRING);
            expect(result).toContain("--destination is required");
        });
    });

    // #endregion destination

    // -----------------------------------------------------------------------------------------
    // #region help
    // -----------------------------------------------------------------------------------------

    shouldDisplayHelpMenu("deploy", ["aws-s3"]);

    // #endregion help

    // -----------------------------------------------------------------------------------------
    // #region profile
    // -----------------------------------------------------------------------------------------

    describe("profile", () => {
        test("given no '--profile' flag, it displays an error", async () => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand("deploy", [
                "aws-s3",
            ]);

            // Assert
            expect(result).toContain(ERROR_OUTPUT_STRING);
            expect(result).toContain("--profile is required");
        });
    });

    // #endregion profile
});

// #endregion Tests
