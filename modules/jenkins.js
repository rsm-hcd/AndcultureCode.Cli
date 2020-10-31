// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const {
    StringUtils,
    CollectionUtils,
} = require("andculturecode-javascript-core");
const echo = require("./echo");
const fs = require("fs");
const os = require("os");
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
            return false;
        }
        let config = BASE_CONFIG;
        Object.assign(config, { url, username, token });
        return this.writeToConfig(config);
    },
    getConfig() {
        const configPath = this.getConfigPath();
        const configFile = fs.readFileSync(configPath);
        if (configFile == null) {
            return undefined;
        }
        if (StringUtils.isEmpty(configFile)) {
            return BASE_CONFIG;
        }
        return JSON.parse(configFile);
    },
    getConfigPath() {
        const homeDir = os.homedir();
        const configPath = upath.toUnix(upath.join(homeDir, CONFIG_FILE));
        return configPath;
    },
    writeToConfig(jsonConfig) {
        const value = JSON.stringify(jsonConfig);
        const configPath = this.getConfigPath();
        try {
            fs.writeFileSync(configPath, value);
        } catch (error) {
            return false;
        }
        return true;
    },
};
// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = jenkins;

// #endregion Exports
