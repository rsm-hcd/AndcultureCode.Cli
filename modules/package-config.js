// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const {
    CoreUtils,
    CollectionUtils,
} = require("andculturecode-javascript-core");
const { CLI_NAME, PACKAGE_JSON } = require("./constants");
const finder = require("find-package-json");
const upath = require("upath");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

/**
 * Default object to be returned if the 'and-cli' section of the package.json is missing
 */
const _defaultConfig = {
    aliases: {},
};

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

/**
 * Module to wrap access to the package.json file. Any reading/transforming of data from that file
 * should live here.
 */
const packageConfig = {
    DEFAULT_CONFIG: _defaultConfig,

    /**
     * Returns the package.json file for the base `and-cli` package.
     */
    getBase() {
        return require(upath.join("..", PACKAGE_JSON));
    },

    /**
     * Returns the 'description' field from the package.json file of the base `and-cli` package.
     */
    getBaseDescription() {
        const { description } = this.getBase();
        return description;
    },

    /**
     * Returns the 'version' field from the package.json file of the base `and-cli` package.
     */
    getBaseVersion() {
        const { version } = this.getBase();
        return version;
    },

    /**
     * Returns the package.json file nearest to the current directory. Use this if you need to
     * retrieve the package.json file for your local project and not the base package.json.
     *
     * Note that this will traverse upwards from the current directory to look for a package.json,
     * and return the first match. If no package.json is found, it will return the base package.json
     */
    getLocal() {
        const { value: localPackageJson } = finder().next();
        if (localPackageJson == null) {
            return this.getBase();
        }

        return localPackageJson;
    },

    /**
     * Returns the first binary name from the local package.json file. If no 'bin' section exists,
     * or it contains no values, it returns `undefined`. If multiple keys exist, only the first will
     * be returned.
     */
    getLocalBinName() {
        const localPackageJson = this.getLocal();
        if (localPackageJson == null || localPackageJson["bin"] == null) {
            return undefined;
        }

        const bin = localPackageJson["bin"];
        const keys = Object.keys(bin);
        if (CollectionUtils.isEmpty(keys)) {
            return undefined;
        }

        return keys[0];
    },

    /**
     * Returns the 'and-cli' config section for the currently executing package, or a default object.
     */
    getLocalConfigOrDefault() {
        let packageJson = this.getLocal();
        if (packageJson[CLI_NAME] == null) {
            return _defaultConfig;
        }

        // Return the 'and-cli' section merged with the default config structure if certain properties are not set
        return CoreUtils.merge(packageJson[CLI_NAME], _defaultConfig);
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = packageConfig;

// #endregion Exports
