import { StringUtils, CollectionUtils } from "andculturecode-javascript-core";
import { Echo } from "./echo";
import fs from "fs";
import os from "os";
import upath from "upath";

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

const Jenkins = {
    CONFIG_FILE,
    configureCredentials(
        url: string,
        username: string,
        token: string
    ): boolean {
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
            Echo.errors(errors);
            return false;
        }
        let config = BASE_CONFIG;
        Object.assign(config, { url, username, token });
        return this.writeToConfig(config);
    },
    getConfig(): any {
        const configPath = this.getConfigPath();
        let configFile;
        try {
            configFile = fs.readFileSync(configPath);
        } catch (error) {
            return undefined;
        }

        if (configFile == null) {
            return undefined;
        }
        if (StringUtils.isEmpty(configFile?.toString())) {
            return BASE_CONFIG;
        }
        return JSON.parse(configFile.toString());
    },
    getConfigPath(): string {
        const homeDir = os.homedir();
        const configPath = upath.join(homeDir, CONFIG_FILE);
        return configPath;
    },
    writeToConfig(jsonConfig: any): boolean {
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

export { Jenkins };

// #endregion Exports
