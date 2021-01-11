#!/usr/bin/env node

import { CommandRunner } from "./modules/command-runner";
import { DeployConfig } from "./modules/deploy-config";
import { Echo } from "./modules/echo";
import { FrontendPath } from "./modules/frontend-path";
import { WebpackPublish } from "./modules/webpack-publish";
import program from "commander";
import shell from "shelljs";
import { Azure } from "./modules/azure";
import { AzureStorageRemove } from "./modules/azure-storage-remove";

CommandRunner.run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Variables
    // -----------------------------------------------------------------------------------------

    let clientId: string;
    let destinationContainer: string;
    let preclearDestinationAssets: boolean = false;
    const pythonInstallerUrl: string =
        "https://www.python.org/ftp/python/3.7.4/python-3.7.4-amd64.exe";
    let recursive: boolean = false;
    let secret: string;
    let sourceContainer: string;
    let tenantId: string;
    let username: string;

    // #endregion Variables

    /// -----------------------------------------------------------------------------------------
    // #region Functions
    // -----------------------------------------------------------------------------------------

    const restoreAzureStorage = {
        description() {
            return "Restore application assets in Azure Storage";
        },
        run() {
            // Check system/command requirements
            this.validateOrExit();

            // Configure .env.local to set public url before publish
            if (program.publicUrl) {
                DeployConfig.configurePublicUrl(program.publicUrl);
            }

            // Locally publish frontend via webpack
            if (program.publish && program.webpack) {
                const publishResult = WebpackPublish.run();
                if (!publishResult) {
                    shell.exit(1);
                }
            }

            // Login to Azure
            if (username != null) {
                Azure.login(username, secret);
            } else {
                Azure.login(clientId, tenantId, secret);
            }

            //
            if (preclearDestinationAssets) {
                AzureStorageRemove.allContainerBlobsRecursively(
                    destinationContainer
                );
            }
            // // Deploy build artifacts to Azure Storage
            // Echo.message("Copying local build artifacts to Azure Storage...");
            // Echo.message(` - Source path: ${sourcePath}`);
            // Echo.message(` - Destination path: ${destination}`);

            // const copyCommand = this.cmd();
            // Echo.message(` - Command: ${copyCommand}`);
            // if (shell.exec(copyCommand, { silent: false }).code !== 0) {
            //     Echo.error(" - Failed to deploy to Azure Storage");
            //     Azure.logout();
            //     shell.exit(1);
            // }

            // Logout from Azure
            Azure.logout();

            Echo.newLine();
            Echo.success("Application successfully deployed to Azure Storage!");
        },
        validateOrExit() {
            const errors = [];

            // Validate arguments
            preclearDestinationAssets = program.preclearDestinationAssets;

            const missingServicePrincipalArgs =
                clientId == null || tenantId == null;

            if (username == null && missingServicePrincipalArgs) {
                errors.push(
                    "when --client-id or --tenant-id not provided, --username is required"
                );
            }

            secret = program.secret;
            if (secret == null) {
                errors.push("--secret is required");
            }

            destinationContainer = program.destinationContainer;
            if (destinationContainer == null) {
                errors.push("--destination-container is required");
            }

            if (program.recursive != null) {
                recursive = program.recursive;
            }

            sourceContainer = program.sourceContainer;
            if (program.sourceContainer == null) {
                errors.push("--source-container is required");
            }

            // Bail if up-front arguments are errored
            if (errors.length > 0) {
                Echo.errors(errors);
                shell.exit(1);
            }

            if (!shell.which("az")) {
                Echo.message(
                    "Azure CLI not found. Attempting install via PIP..."
                );

                if (!shell.which("pip")) {
                    Echo.error(`PIP is required - ${pythonInstallerUrl}`);
                    shell.exit(1);
                }

                if (shell.exec("pip install azure-cli").code !== 0) {
                    Echo.error("Failed to install azure cli via pip");
                    shell.exit(1);
                }

                Echo.success(" - Successfully installed Azure CLI");
            }

            // Handle errors
            if (errors.length > 0) {
                Echo.errors(errors);
                shell.exit(1);
            }

            return true;
        },
    };

    // #endregion Functions

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option")
        .description(restoreAzureStorage.description())
        .option(
            "--client-id <clientID>",
            "Required Client ID (if deploying using Service Principal)"
        )
        .option(
            "--destination-container <destinationContainer>",
            "Required name of container where assets will be restored to"
        )
        .option("--recursive", "Optional flag to recursively restore a folder")
        .option(
            "--secret <profile>",
            "Required secret for login -- either client secret for service principal or account password"
        )
        .option(
            "--source-container <sourceContainer>",
            `Required name of container where assets will be copied from`
        )
        .option(
            "--tenant-id <tenantID>",
            "Required Tenant ID (if deploying using Service Principal)"
        )
        .option(
            "--username <username>",
            "Required Azure username (if deploying using Azure credentials)"
        )
        .parse(process.argv);

    await restoreAzureStorage.run();

    // #endregion Entrypoint
});
