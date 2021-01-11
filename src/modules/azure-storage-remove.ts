import { Echo } from "./echo";
import shell from "shelljs";

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const AZ_COMMAND = "az storage remove";

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const _execute = (command: string, errorMessage: string) => {
    if (shell.exec(command, { silent: false }).code !== 0) {
        Echo.error(errorMessage);
        shell.exit(1);
    }
};

const AzureStorageRemove = {
    allContainerBlobsRecursively(container: string) {
        let command = `${AZ_COMMAND} -c ${container}`; // --recursive`;
        let errorMessage = ` - Failed to remove all container blobs for container named ${container}`;
        _execute(command, errorMessage);
    },
    // allDirectoryBlobsRecursively(container, directoryPath) {
    //     let command = `${AZ_COMMAND} -c ${container} -n ${directoryPath}`;
    //     let errorMessage = ` - Failed to remove all container blobs for container named ${container}`;
    //     _execute(command, errorMessage);
    //     return command;
    // },
    // singleBlob(container, blob) {
    //     let command = `${AZ_COMMAND} -c ${container} -n ${blob}`;
    //     let errorMessage = ` - Failed to remove the blobs named ${blob} for container named ${container}`;
    //     _execute(command, errorMessage);
    //     return command;
    // },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { AzureStorageRemove };

// #endregion Exports
