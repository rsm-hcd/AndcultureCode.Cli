import { shouldDisplayHelpMenu } from "./tests/shared-specs";
import { TestUtils } from "./tests/test-utils";
import { Constants } from "./modules/constants";

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
            const result = await TestUtils.executeCliCommand("deploy", [
                "aws-s3",
            ]);

            // Assert
            expect(result).toContain(Constants.ERROR_OUTPUT_STRING);
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
            const result = await TestUtils.executeCliCommand("deploy", [
                "aws-s3",
            ]);

            // Assert
            expect(result).toContain(Constants.ERROR_OUTPUT_STRING);
            expect(result).toContain("--profile is required");
        });
    });

    // #endregion profile
});

// #endregion Tests
