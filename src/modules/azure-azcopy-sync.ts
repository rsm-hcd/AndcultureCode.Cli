import { Echo } from "./echo";
import shell from "shelljs";
import { CommandStringBuilder } from "../utilities/command-string-builder";
import child_process from "child_process";

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

const _getCommandStringBuilder = (
    source: string,
    destination: string,
    flags: string[]
): CommandStringBuilder => {
    return new CommandStringBuilder(
        "azcopy",
        "sync",
        source,
        destination,
        ...flags
    );
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
    action: string,
    flags: string[]
) => {
    const { cmd, args } = _getCommandStringBuilder(source, destination, flags);

    Echo.message(`Starting the action of ${action}`);
    const { status } = child_process.spawnSync(cmd, args, {
        stdio: "inherit",
        shell: true,
    });
    if (status != null && status !== 0) {
        Echo.error(`Failed when performing the action of ${action}`);
        shell.exit(status);
    }
    Echo.success(`Succeeded when performing the action of ${action}`);
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
        const action = `syncing blob from local file path of ${options.localFilePath} to blob storage URL of ${destination}`;
        _sync(options.localFilePath, destination, action, flags);
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
        const action = `syncing blobs from blob storage URL of ${source} to blob storage URL of ${destination}`;
        _sync(source, destination, action, flags);
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export {
    AzureAzcopySync,
    BlobStorageUrlParts,
    SyncLocalFileOptions,
    SyncContainerOptions,
};

// #endregion Exports
