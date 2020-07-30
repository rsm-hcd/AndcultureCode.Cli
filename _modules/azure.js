// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const echo  = require("./echo");
const shell = require("shelljs");

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const azure = {
    /**
     * Executes `az login` using username/password.
     * @param {*} username Azure account username
     * @param {*} secret Azure account password
     */
    login(username, secret) {
        const loginCommand = `az login -u ${username} -p ${secret}`;
        if (shell.exec(loginCommand).code !== 0) {
            echo.error(" - Failed to login to Azure");
            shell.exit(1);
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
        if (shell.exec(loginCommand).code !== 0) {
            echo.error(" - Failed to login to Azure");
            shell.exit(1);
        }
    },
    logout() {
        const logoutCmd = "az logout";
        if (shell.exec(logoutCmd).code !== 0) {
            echo.error(" - Failed to logout from Azure, it is recommended `az logout` is run manually");
            shell.exit(1);
        }
    },
}

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = azure;

// #endregion Exports
