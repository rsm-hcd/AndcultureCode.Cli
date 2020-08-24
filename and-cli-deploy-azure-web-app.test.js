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

describe("and-cli-deploy-azure-web-app", () => {
    // -----------------------------------------------------------------------------------------
    // #region appName
    // -----------------------------------------------------------------------------------------

    describe("appName", () => {
        test("given no '--app-name' flag, it displays an error", async () => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand("deploy", [
                "azure-web-app",
            ]);

            // Assert
            expect(result).toContain(ERROR_OUTPUT_STRING);
            expect(result).toContain("--app-name is required");
        });
    });

    // #endregion appName

    // -----------------------------------------------------------------------------------------
    // #region branch
    // -----------------------------------------------------------------------------------------

    describe("branch", () => {
        test("given no '--branch' flag, it displays an error", async () => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand("deploy", [
                "azure-web-app",
            ]);

            // Assert
            expect(result).toContain(ERROR_OUTPUT_STRING);
            expect(result).toContain("--branch is required");
        });
    });

    // #endregion branch

    // -----------------------------------------------------------------------------------------
    // #region clientId and tenantId
    // -----------------------------------------------------------------------------------------

    describe("clientId and tenantId", () => {
        test("given no '--client-id' or '--tenant-id' flag, it displays an error", async () => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand("deploy", [
                "azure-web-app",
            ]);

            // Assert
            expect(result).toContain(ERROR_OUTPUT_STRING);
            expect(result).toContain("--client-id or --tenant-id not provided");
        });

        test("given only '--tenant-id' flag, it displays an error", async () => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand(
                "deploy",
                ["azure-web-app"],
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
                ["azure-web-app"],
                "--client-id=test"
            );

            // Assert
            expect(result).toContain(ERROR_OUTPUT_STRING);
            expect(result).toContain("--client-id or --tenant-id not provided");
        });
    });

    // #endregion clientId and tenantId

    // -----------------------------------------------------------------------------------------
    // #region help
    // -----------------------------------------------------------------------------------------

    shouldDisplayHelpMenu("deploy", ["azure-web-app"]);

    // #endregion help

    // -----------------------------------------------------------------------------------------
    // #region remote
    // -----------------------------------------------------------------------------------------

    describe("remote", () => {
        test("given no '--remote' flag, it displays an error", async () => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand("deploy", [
                "azure-web-app",
            ]);

            // Assert
            expect(result).toContain(ERROR_OUTPUT_STRING);
            expect(result).toContain("--remote is required");
        });
    });

    // #endregion remote

    // -----------------------------------------------------------------------------------------
    // #region resourceGroup
    // -----------------------------------------------------------------------------------------

    describe("resourceGroup", () => {
        test("given no '--resource-group' flag, it displays an error", async () => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand("deploy", [
                "azure-web-app",
            ]);

            // Assert
            expect(result).toContain(ERROR_OUTPUT_STRING);
            expect(result).toContain("--resource-group is required");
        });
    });

    // #endregion resourceGroup

    // -----------------------------------------------------------------------------------------
    // #region secret
    // -----------------------------------------------------------------------------------------

    describe("secret", () => {
        test("given no '--secret' flag, it displays an error", async () => {
            // Arrange & Act
            const result = await testUtils.executeCliCommand("deploy", [
                "azure-web-app",
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
                ["azure-web-app"],
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
                ["azure-web-app"],
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
                ["azure-web-app"],
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
