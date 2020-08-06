// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const echo  = require("./echo");
const shell = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

const pythonInstallerUrl  = "https://www.python.org/ftp/python/3.7.4/python-3.7.4-amd64.exe";

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const azure = {
    validateAzCli() {
        if (!shell.which("az")) {
            echo.message("Azure CLI not found. Attempting install via PIP...");

            if (!shell.which("pip")) {
                echo.error(`PIP is required - ${pythonInstallerUrl}`);
                shell.exit(1);
            }

            if (shell.exec("pip install azure-cli").code !== 0) {
                echo.error("Failed to install azure cli via pip");
                shell.exit(1);
            }

            echo.success(" - Successfully installed Azure CLI");
        }
    },
    /**
     * Executes `az login` using username/password.
     * @param {*} username Azure account username
     * @param {*} secret Azure account password
     */
    login(username, secret) {
        const loginCommand = `az login -u ${username} -p ${secret}`;

        const cmdResult = shell.exec(loginCommand);
        if (cmdResult.code !== 0) {
            echo.error(" - Failed to login to Azure");
            shell.exit(cmdResult);
        }
    },
    /**
     * Executes `az login` using service principal.
     * @param {*} clientId Client ID for the service principal
     * @param {*} tenantId Tenant ID for the service principal
     * @param {*} secret Secret for the service principal
     */
    login(clientId, tenantId, secret) {
        const loginCommand = `az login --service-principal -u ${clientId} -t ${tenantId} -p=${secret}`;

        const cmdResult = shell.exec(loginCommand);
        if (cmdResult.code !== 0) {
            echo.error(" - Failed to login to Azure");
            shell.exit(cmdResult.code);
        }
    },
    /**
     * Executes `az logout` to logout of az cli.
     */
    logout() {
        const logoutCmd = "az logout";

        const cmdResult = shell.exec(logoutCmd);
        if (cmdResult.code !== 0) {
            echo.error(" - Failed to logout from Azure, it is recommended `az logout` is run manually");
            shell.exit(cmdResult.code);
        }
    },
}

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = azure;

// #endregion Exports
