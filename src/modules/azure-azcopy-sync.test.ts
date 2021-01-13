import { TestUtils } from "../tests/test-utils";
import {
    AzureAzcopySync,
    BlobStorageUrlParts,
    SyncContainerOptions,
    SyncLocalFileOptions,
} from "./azure-azcopy-sync";
import faker from "faker";

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

let command = "azcopy";
let spawnSyncArgs = { shell: true, stdio: "inherit" };

// endregion Variables

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const _getBlobStorageUrl = (urlParts: BlobStorageUrlParts) => {
    const path = urlParts.path ?? "";
    const sasToken = urlParts.sasToken ?? "";
    return `"https://${urlParts.account}.blob.core.windows.net/${urlParts.container}/${path}${sasToken}"`;
};

// endregion Variables

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

describe("AzureAzcopySync", () => {
    let spawnSyncSpy: jest.SpyInstance;
    let shellExitSpy: jest.SpyInstance;

    beforeEach(() => {
        spawnSyncSpy = TestUtils.spyOnSpawnSync();
        shellExitSpy = TestUtils.spyOnShellExit();
    });

    // -----------------------------------------------------------------------------------------
    // #region localFile
    // -----------------------------------------------------------------------------------------

    describe("localFile", () => {
        let localFileOptions: SyncLocalFileOptions;
        let calculatedCommandArgs: string[];

        beforeEach(() => {
            localFileOptions = {
                localFilePath: "c:/something/awesome/text.txt",
                destination: {
                    account: "test_account",
                    container: "test_container",
                    path: "test_path",
                    sasToken: "?test_sas_token=test",
                },
            };
            calculatedCommandArgs = [
                "sync",
                "c:/something/awesome/text.txt",
                '"https://test_account.blob.core.windows.net/test_container/test_path?test_sas_token=test"',
                "--recursive=false",
            ];
        });

        test("when localFilePath provided then used as the source path argument", () => {
            // Arrange
            localFileOptions.localFilePath = "c:/some/other/directory";
            calculatedCommandArgs[1] = localFileOptions.localFilePath;

            // Act
            AzureAzcopySync.localFile(localFileOptions);

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalledWith(
                command,
                calculatedCommandArgs,
                spawnSyncArgs
            );
        });

        test("when destination.account provided then used in the destination URL argument", () => {
            // Arrange
            localFileOptions.destination.account = "other_test_account";
            calculatedCommandArgs[2] = _getBlobStorageUrl(
                localFileOptions.destination
            );

            // Act
            AzureAzcopySync.localFile(localFileOptions);

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalledWith(
                command,
                calculatedCommandArgs,
                spawnSyncArgs
            );
        });

        test("when destination.container provided then used in the destination URL argument", () => {
            // Arrange
            localFileOptions.destination.container = "other_test_container";
            calculatedCommandArgs[2] = _getBlobStorageUrl(
                localFileOptions.destination
            );

            // Act
            AzureAzcopySync.localFile(localFileOptions);

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalledWith(
                command,
                calculatedCommandArgs,
                spawnSyncArgs
            );
        });

        test("when destination.path provided then used in the destination URL argument", () => {
            // Arrange
            localFileOptions.destination.path = "other_test_account";
            calculatedCommandArgs[2] = _getBlobStorageUrl(
                localFileOptions.destination
            );

            // Act
            AzureAzcopySync.localFile(localFileOptions);

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalledWith(
                command,
                calculatedCommandArgs,
                spawnSyncArgs
            );
        });

        test("when destination.path not provided then not used in the destination URL argument", () => {
            // Arrange
            delete localFileOptions.destination.path;
            calculatedCommandArgs[2] = _getBlobStorageUrl(
                localFileOptions.destination
            );

            // Act
            AzureAzcopySync.localFile(localFileOptions);

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalledWith(
                command,
                calculatedCommandArgs,
                spawnSyncArgs
            );
        });

        test("when destination.sasToken provided then used in the destination URL argument", () => {
            // Arrange
            localFileOptions.destination.sasToken = "other_test_sas_token";
            calculatedCommandArgs[2] = _getBlobStorageUrl(
                localFileOptions.destination
            );

            // Act
            AzureAzcopySync.localFile(localFileOptions);

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalledWith(
                command,
                calculatedCommandArgs,
                spawnSyncArgs
            );
        });

        test("when destination.sasToken not provided then not used in the destination URL argument", () => {
            // Arrange
            delete localFileOptions.destination.sasToken;
            calculatedCommandArgs[2] = _getBlobStorageUrl(
                localFileOptions.destination
            );

            // Act
            AzureAzcopySync.localFile(localFileOptions);

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalledWith(
                command,
                calculatedCommandArgs,
                spawnSyncArgs
            );
        });

        test(`when fails then it calls shell.exit`, async () => {
            // Arrange
            const exitCode = faker.random.number({ min: 1 });
            const spawnSyncSpy = TestUtils.spyOnSpawnSync(exitCode);

            // Act
            await AzureAzcopySync.localFile(localFileOptions);

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalled();
            expect(shellExitSpy).toHaveBeenCalledWith(exitCode);
        });
    });

    // #endregion localFile

    // -----------------------------------------------------------------------------------------
    // #region containers
    // -----------------------------------------------------------------------------------------

    describe("containers", () => {
        let containerOptions: SyncContainerOptions;
        let calculatedCommandArgs: string[];

        beforeEach(() => {
            containerOptions = {
                deleteDestination: false,
                destination: {
                    account: "destination_test_account",
                    container: "destination_test_container",
                    path: "destination_test_path",
                    sasToken: "?destination_test_sas_token=test",
                },
                recursive: false,
                source: {
                    account: "source_test_account",
                    container: "source_test_container",
                    path: "source_test_path",
                    sasToken: "?source_test_sas_token=test",
                },
            };
            calculatedCommandArgs = [
                "sync",
                '"https://source_test_account.blob.core.windows.net/source_test_container/source_test_path?source_test_sas_token=test"',
                '"https://destination_test_account.blob.core.windows.net/destination_test_container/destination_test_path?destination_test_sas_token=test"',
                "--recursive=false",
                "--delete-destination=false",
            ];
        });

        test("when deleteDestination provided then used as the 5th argument", () => {
            // Arrange
            containerOptions.deleteDestination = true;
            calculatedCommandArgs[4] = "--delete-destination=true";

            // Act
            AzureAzcopySync.containers(containerOptions);

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalledWith(
                command,
                calculatedCommandArgs,
                spawnSyncArgs
            );
        });

        test("when destination.account provided then used in the destination URL argument", () => {
            // Arrange
            containerOptions.destination.account =
                "other_destination_test_account";
            calculatedCommandArgs[2] = _getBlobStorageUrl(
                containerOptions.destination
            );

            // Act
            AzureAzcopySync.containers(containerOptions);

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalledWith(
                command,
                calculatedCommandArgs,
                spawnSyncArgs
            );
        });

        test("when destination.container provided then used in the destination URL argument", () => {
            // Arrange
            containerOptions.destination.container =
                "other_destination_test_container";
            calculatedCommandArgs[2] = _getBlobStorageUrl(
                containerOptions.destination
            );

            // Act
            AzureAzcopySync.containers(containerOptions);

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalledWith(
                command,
                calculatedCommandArgs,
                spawnSyncArgs
            );
        });

        test("when destination.path provided then used in the destination URL argument", () => {
            // Arrange
            containerOptions.destination.path =
                "other_destination_test_account";
            calculatedCommandArgs[2] = _getBlobStorageUrl(
                containerOptions.destination
            );

            // Act
            AzureAzcopySync.containers(containerOptions);

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalledWith(
                command,
                calculatedCommandArgs,
                spawnSyncArgs
            );
        });

        test("when destination.sasToken provided then used in the destination URL argument", () => {
            // Arrange
            containerOptions.destination.sasToken =
                "other_destination_test_sas_token";
            calculatedCommandArgs[2] = _getBlobStorageUrl(
                containerOptions.destination
            );

            // Act
            AzureAzcopySync.containers(containerOptions);

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalledWith(
                command,
                calculatedCommandArgs,
                spawnSyncArgs
            );
        });

        test("when recursive provided then used as the 6th argument", () => {
            // Arrange
            containerOptions.recursive = true;
            calculatedCommandArgs[3] = "--recursive=true";

            // Act
            AzureAzcopySync.containers(containerOptions);

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalledWith(
                command,
                calculatedCommandArgs,
                spawnSyncArgs
            );
        });

        test("when source.account provided then used in the source URL argument", () => {
            // Arrange
            containerOptions.source.account = "other_source_test_account";
            calculatedCommandArgs[1] = _getBlobStorageUrl(
                containerOptions.source
            );

            // Act
            AzureAzcopySync.containers(containerOptions);

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalledWith(
                command,
                calculatedCommandArgs,
                spawnSyncArgs
            );
        });

        test("when source.container provided then used in the source URL argument", () => {
            // Arrange
            containerOptions.source.container = "other_source_test_container";
            calculatedCommandArgs[1] = _getBlobStorageUrl(
                containerOptions.source
            );

            // Act
            AzureAzcopySync.containers(containerOptions);

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalledWith(
                command,
                calculatedCommandArgs,
                spawnSyncArgs
            );
        });

        test("when source.path provided then used in the source URL argument", () => {
            // Arrange
            containerOptions.source.path = "other_source_test_account";
            calculatedCommandArgs[1] = _getBlobStorageUrl(
                containerOptions.source
            );

            // Act
            AzureAzcopySync.containers(containerOptions);

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalledWith(
                command,
                calculatedCommandArgs,
                spawnSyncArgs
            );
        });

        test("when source.path not provided then not used in the source URL argument", () => {
            // Arrange
            delete containerOptions.source.path;
            calculatedCommandArgs[1] = _getBlobStorageUrl(
                containerOptions.source
            );

            // Act
            AzureAzcopySync.containers(containerOptions);

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalledWith(
                command,
                calculatedCommandArgs,
                spawnSyncArgs
            );
        });

        test("when source.sasToken provided then used in the source URL argument", () => {
            // Arrange
            containerOptions.source.sasToken = "other_source_test_sas_token";
            calculatedCommandArgs[1] = _getBlobStorageUrl(
                containerOptions.source
            );

            // Act
            AzureAzcopySync.containers(containerOptions);

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalledWith(
                command,
                calculatedCommandArgs,
                spawnSyncArgs
            );
        });

        test("when source.sasToken not provided then not used in the source URL argument", () => {
            // Arrange
            delete containerOptions.source.sasToken;
            calculatedCommandArgs[1] = _getBlobStorageUrl(
                containerOptions.source
            );

            // Act
            AzureAzcopySync.containers(containerOptions);

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalledWith(
                command,
                calculatedCommandArgs,
                spawnSyncArgs
            );
        });

        test(`when fails then it calls shell.exit`, async () => {
            // Arrange
            const exitCode = faker.random.number({ min: 1 });
            const spawnSyncSpy = TestUtils.spyOnSpawnSync(exitCode);

            // Act
            await AzureAzcopySync.containers(containerOptions);

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalled();
            expect(shellExitSpy).toHaveBeenCalledWith(exitCode);
        });
    });

    // #endregion containers
});

// #endregion Tests
