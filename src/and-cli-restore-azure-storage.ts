#!/usr/bin/env node

import { CommandRunner } from "./modules/command-runner";
import { Echo } from "./modules/echo";
import program from "commander";
import shell from "shelljs";
import { AzureAzcopySync } from "./modules/azure-azcopy-sync";

CommandRunner.run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Variables
    // -----------------------------------------------------------------------------------------

    let deleteDestination: boolean = false;
    let destinationAccount: string;
    let destinationContainer: string;
    let destinationSasToken: string;
    let recursive: boolean = false;
    let sourceAccount: string;
    let sourceContainer: string;
    let sourceSasToken: string;

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

            /*
                Following options currently only support syncing utilizing Azure SAS Tokens.
                Consider future refactor to allow this restore aspect to first generate a SAS
                Token using a different means of authentication (service provider, active
                directory, etc...).  Consider using AZ login and a service provider to then
                generate a SAS before passing that SAS Token into the Azcopy module later instead
                of forcing the consumer to define a hard coded value or force the consumer to
                generate one on its own cadence.
            */
            const options = {
                deleteDestination: deleteDestination,
                destination: {
                    account: destinationAccount,
                    container: destinationContainer,
                    sasToken: destinationSasToken,
                },
                recursive: recursive,
                source: {
                    account: sourceAccount,
                    container: sourceContainer,
                    sasToken: sourceSasToken,
                },
            };

            AzureAzcopySync.containers(options);

            Echo.newLine();
            Echo.success(
                `Container of ${options.source.container} successfully synced to container of ${options.destination.container} in Azure Blob Storage!`
            );
        },
        validateOrExit() {
            const errors = [];

            if (program.deleteDestination != null) {
                deleteDestination = program.deleteDestination;
            }
            if (program.recursive != null) {
                recursive = program.recursive;
            }

            // Validate arguments
            destinationAccount = program.destinationAccount;
            if (destinationAccount == null) {
                errors.push("--destination-account is required");
            }

            destinationContainer = program.destinationContainer;
            if (destinationContainer == null) {
                errors.push("--destination-container is required");
            }

            destinationSasToken = program.destinationSasToken;
            if (destinationContainer == "" || destinationContainer == null) {
                errors.push("--destination-sas-token is required");
            }

            sourceAccount = program.sourceAccount;
            if (sourceAccount == null) {
                errors.push("--source-account is required");
            }

            sourceContainer = program.sourceContainer;
            if (sourceContainer == null) {
                errors.push("--source-container is required");
            }

            sourceSasToken = program.sourceSasToken;
            if (sourceContainer == "" || sourceContainer == null) {
                errors.push("--source-sas-token is required");
            }

            // Bail if up-front arguments are errored
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
            "--delete-destination <deleteDestination>",
            "Optional flag to delete any blogs and folders from the destination that don't exist in the source"
        )
        .option(
            "--destination-account <destinationAccount>",
            "Required name of destination blob storage account"
        )
        .option(
            "--destination-container <destinationContainer>",
            "Required name of destination container where assets will be restored to"
        )
        .option(
            "--destination-sas-token <destinationSasToken>",
            "Required SAS Token for access to the provided destination account/container"
        )
        .option(
            "--recursive <recursive>",
            "Optional flag to recursively restore the contents of the container"
        )
        .option(
            "--source-account <desctinationAccount>",
            "Required name of source blob storage account"
        )
        .option(
            "--source-container <sourceContainer>",
            "Required name of source container where assets will be restored to"
        )
        .option(
            "--source-sas-token <sourceSasToken>",
            "Required SAS Token for access to the provided source account/container"
        )
        .parse(process.argv);

    await restoreAzureStorage.run();

    // #endregion Entrypoint
});
