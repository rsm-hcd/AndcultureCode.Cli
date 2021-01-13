import { shouldDisplayHelpMenu } from "./tests/shared-specs";
import { TestUtils } from "./tests/test-utils";
import { Constants } from "./modules/constants";

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("and-cli-restore-azure-storage", () => {
    // -----------------------------------------------------------------------------------------
    // #region clientId and tenantId
    // -----------------------------------------------------------------------------------------

    // #endregion clientId and tenantId

    // -----------------------------------------------------------------------------------------
    // #region destination
    // -----------------------------------------------------------------------------------------

    describe("destination-account", () => {
        test("given no '--destination-account' flag, it displays an error", async () => {
            // Arrange & Act
            const result = await TestUtils.executeCliCommand("restore", [
                "azure-storage",
            ]);

            // Assert
            expect(result).toContain(Constants.ERROR_OUTPUT_STRING);
            expect(result).toContain("--destination-account is required");
        });
    });

    describe("destination-container", () => {
        test("given no '--destination-container' flag, it displays an error", async () => {
            // Arrange & Act
            const result = await TestUtils.executeCliCommand("restore", [
                "azure-storage",
            ]);

            // Assert
            expect(result).toContain(Constants.ERROR_OUTPUT_STRING);
            expect(result).toContain("--destination-container is required");
        });
    });

    describe("destination-sas-token", () => {
        test("given no '--destination-sas-token' flag, it displays an error", async () => {
            // Arrange & Act
            const result = await TestUtils.executeCliCommand("restore", [
                "azure-storage",
            ]);

            // Assert
            expect(result).toContain(Constants.ERROR_OUTPUT_STRING);
            expect(result).toContain("--destination-sas-token is required");
        });
    });

    // #endregion destination

    // -----------------------------------------------------------------------------------------
    // #region source
    // -----------------------------------------------------------------------------------------

    describe("source-account", () => {
        test("given no '--source-account' flag, it displays an error", async () => {
            // Arrange & Act
            const result = await TestUtils.executeCliCommand("restore", [
                "azure-storage",
            ]);

            // Assert
            expect(result).toContain(Constants.ERROR_OUTPUT_STRING);
            expect(result).toContain("--source-account is required");
        });
    });

    describe("source-container", () => {
        test("given no '--source-container' flag, it displays an error", async () => {
            // Arrange & Act
            const result = await TestUtils.executeCliCommand("restore", [
                "azure-storage",
            ]);

            // Assert
            expect(result).toContain(Constants.ERROR_OUTPUT_STRING);
            expect(result).toContain("--source-container is required");
        });
    });

    describe("source-sas-token", () => {
        test("given no '--source-sas-token' flag, it displays an error", async () => {
            // Arrange & Act
            const result = await TestUtils.executeCliCommand("restore", [
                "azure-storage",
            ]);

            // Assert
            expect(result).toContain(Constants.ERROR_OUTPUT_STRING);
            expect(result).toContain("--source-sas-token is required");
        });
    });

    // #endregion source

    // -----------------------------------------------------------------------------------------
    // #region help
    // -----------------------------------------------------------------------------------------

    shouldDisplayHelpMenu("restore", ["azure-storage"]);

    // #endregion help
});

// #endregion Tests
