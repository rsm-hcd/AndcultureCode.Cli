// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const {
    StringUtils,
    CollectionUtils,
} = require("andculturecode-javascript-core");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { echo } = require("shelljs");
const upath = require("upath");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------
const CONFIG_FILE = ".jenkinsconfig";
const BASE_CONFIG = {
    url: "",
    username: "",
    token: "",
    profiles: {},
};

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const jenkins = {
    configureCredentials(url, username, token) {
        const errors = [];
        if (StringUtils.isEmpty(url)) {
            errors.push("Url is required");
        }
        if (StringUtils.isEmpty(username)) {
            errors.push("Username is required");
        }
        if (StringUtils.isEmpty(token)) {
            errors.push("Api token is required");
        }
        if (CollectionUtils.hasValues(errors)) {
            echo.errors(errors);
            shell.exit(1);
        }
        let config = BASE_CONFIG;
        Object.assign(config, { url, username, token });
        this.writeToConfig(config);
    },
    getConfig() {
        const configPath = this.getConfigPath();
        const configFile = fs.readFileSync(configPath);
        return JSON.parse(configFile);
    },
    getConfigPath() {
        const homeDir = os.homedir();
        return (configPath = upath.toUnix(path.join(homeDir, CONFIG_FILE)));
    },
    writeToConfig(jsonConfig) {
        const value = JSON.stringify(jsonConfig);
        const configPath = this.getConfigPath();
        fs.writeFileSync(configPath, value);
    },
};
// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = jenkins;

// #endregion Exports
