import { Echo } from "./echo";
import shell from "shelljs";

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const AZCOPY_COMMAND = "azcopy sync";

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Interfaces
// -----------------------------------------------------------------------------------------

interface BlobStorageUrlParts {
    account: string;
    container: string;
    path?: string;
    sasToken?: string;
}

interface SyncLocalFileOptions {
    localFilePath: string;
    destination: BlobStorageUrlParts;
}

interface SyncContainerOptions {
    deleteDestination: boolean;
    destination: BlobStorageUrlParts;
    recursive: boolean;
    source: BlobStorageUrlParts;
}

// #endregion Interfaces

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const _execute = (command: string, errorMessage: string) => {
    if (shell.exec(command, { silent: false }).code !== 0) {
        Echo.error(errorMessage);
        shell.exit(1);
    }
};

const _getBlobStorageUrl = (urlParts: BlobStorageUrlParts) => {
    const path = urlParts.path ?? "";
    const sasToken = urlParts.sasToken ?? "";
    return `"https://${urlParts.account}.blob.core.windows.net/${urlParts.container}/${path}${sasToken}"`;
};

const _getDeleteDestination = (deleteDestination: boolean) => {
    return `--delete-destination=${deleteDestination}`;
};

const _getRecursiveFlag = (recursive: boolean) => {
    return `--recursive=${recursive}`;
};

const _sync = (
    source: string,
    destination: string,
    errorMessage: string,
    flags: string[]
) => {
    const command = `${AZCOPY_COMMAND} ${source} ${destination} ${flags.join(
        " "
    )}`;
    Echo.success(`processing command ${command}`);

    _execute(command, errorMessage);
};

const AzureAzcopySync = {
    /**
     * Syncs a local file from the calling machine to the provided destination blob storage container
     *
     * @param options Options bag with all available parameters
     */
    localFile(options: SyncLocalFileOptions) {
        const destination = _getBlobStorageUrl(options.destination);
        const flags = [_getRecursiveFlag(false)];
        const errorMessage = `Failed to sync blob from ${options.localFilePath} to ${destination}`;
        _sync(options.localFilePath, destination, errorMessage, flags);
    },

    /**
     * Syncs the provided source container with the provided destination container
     *
     * @param options Options bag with all available parameters
     */
    containers(options: SyncContainerOptions) {
        const source = _getBlobStorageUrl(options.source);
        const destination = _getBlobStorageUrl(options.destination);
        const flags = [
            _getRecursiveFlag(options.recursive),
            _getDeleteDestination(options.deleteDestination),
        ];
        const errorMessage = `Failed to sync blobs from ${source} to ${destination}`;
        _sync(source, destination, errorMessage, flags);
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { AzureAzcopySync };

// #endregion Exports
