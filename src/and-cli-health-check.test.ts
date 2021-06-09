import { Constants } from "./modules/constants";
import { shouldDisplayHelpMenu } from "./tests/shared-specs";
import { TestUtils } from "./tests/test-utils";
// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("and-cli-health-check", () => {
    // -----------------------------------------------------------------------------------------
    // #region endpoint
    // -----------------------------------------------------------------------------------------

    describe("endpoint", () => {
        test("given no <endpoint> argument, it displays an error", async () => {
            // Arrange & Act
            const result = await TestUtils.executeCliCommand(
                "health-check",
                [""],
                ["--code 200"] // pass arbitrary argument to bypass help menu
            );

            // Assert
            expect(result).toContain(Constants.ERROR_OUTPUT_STRING);
        });
    });

    // #endregion endpoint

    // -----------------------------------------------------------------------------------------
    // #region help
    // -----------------------------------------------------------------------------------------

    shouldDisplayHelpMenu("health-check");

    // #endregion help
});
// #endregion Tests
