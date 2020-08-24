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

describe("and-cli-deploy-azure-storage", () => {
    // -----------------------------------------------------------------------------------------
    // #region clientId and tenantId
    // -----------------------------------------------------------------------------------------

    describe("clientId and tenantId", () => {
        test("given no '--client-id' or '--tenant-id' flag, it displays an error", async () => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand("deploy", [
                "azure-storage",
            ]);

            // Assert
            expect(result).toContain(ERROR_OUTPUT_STRING);
            expect(result).toContain("--client-id or --tenant-id not provided");
        });

        test("given only '--tenant-id' flag, it displays an error", async () => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand(
                "deploy",
                ["azure-storage"],
                "--tenant-id=test"
            );

            // Assert
            expect(result).toContain(ERROR_OUTPUT_STRING);
            expect(result).toContain("--client-id or --tenant-id not provided");
        });

        test("given only '--client-id' flag, it displays an error", async () => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand(
                "deploy",
                ["azure-storage"],
                "--client-id=test"
            );

            // Assert
            expect(result).toContain(ERROR_OUTPUT_STRING);
            expect(result).toContain("--client-id or --tenant-id not provided");
        });
    });

    // #endregion clientId and tenantId

    // -----------------------------------------------------------------------------------------
    // #region destination
    // -----------------------------------------------------------------------------------------

    describe("destination", () => {
        test("given no '--destination' flag, it displays an error", async () => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand("deploy", [
                "azure-storage",
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

    shouldDisplayHelpMenu("deploy", ["azure-storage"]);

    // #endregion help

    // -----------------------------------------------------------------------------------------
    // #region secret
    // -----------------------------------------------------------------------------------------

    describe("secret", () => {
        test("given no '--secret' flag, it displays an error", async () => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand("deploy", [
                "azure-storage",
            ]);

            // Assert
            expect(result).toContain(ERROR_OUTPUT_STRING);
            expect(result).toContain("--secret is required");
        });
    });

    // #endregion secret

    // -----------------------------------------------------------------------------------------
    // #region username
    // -----------------------------------------------------------------------------------------

    describe("username", () => {
        test("given no '--username' and no '--client-id' flag, it displays an error", async () => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand(
                "deploy",
                ["azure-storage"],
                "--tenant-id=test"
            );

            // Assert
            expect(result).toContain(ERROR_OUTPUT_STRING);
            expect(result).toContain("--username is required");
        });

        test("given no '--username' and no '--tenant-id' flag, it displays an error", async () => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand(
                "deploy",
                ["azure-storage"],
                "--client-id=test"
            );

            // Assert
            expect(result).toContain(ERROR_OUTPUT_STRING);
            expect(result).toContain("--username is required");
        });

        test("given '--username' and no '--tenant-id' or '--client-id' flag, it doesn't display an error", async () => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand(
                "deploy",
                ["azure-storage"],
                "--username=test"
            );

            // Assert
            expect(result).toContain(ERROR_OUTPUT_STRING);
            expect(result).toContain("--username is required");
        });
    });

    // #endregion username
});

// #endregion Tests
