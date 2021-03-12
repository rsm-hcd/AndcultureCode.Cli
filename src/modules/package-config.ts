import { Constants } from "./constants";
import finder from "find-package-json";
import upath from "upath";
import { CollectionUtils, CoreUtils } from "andculturecode-javascript-core";

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

// Must be defined before _defaultConfig variable in scope
const __sections = {
    ALIASES: "aliases",
};

const _defaultConfig = {
    [__sections.ALIASES]: {},
};

// #endregion Constants

/**
 * Module to wrap access to the package.json file. Any reading/transforming of data from that file
 * should live here.
 */
const PackageConfig = {
    // -----------------------------------------------------------------------------------------
    // #region Public Members
    // -----------------------------------------------------------------------------------------

    /**
     * Default object to be returned if the 'and-cli' section of the package.json is missing
     */
    DEFAULT_CONFIG: _defaultConfig,

    /**
     * Object to hold constants for each supported config under the 'and-cli' section
     */
    SECTIONS: __sections,

    // #endregion Public Members

    // -----------------------------------------------------------------------------------------
    // #region Public Functions
    // -----------------------------------------------------------------------------------------

    /**
     * Returns the package.json file for the base `and-cli` package.
     */
    getBase() {
        return require(upath.join("..", "..", Constants.PACKAGE_JSON));
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
        if (
            localPackageJson == null ||
            localPackageJson[Constants.BIN] == null
        ) {
            return undefined;
        }

        const bin = localPackageJson[Constants.BIN];
        const keys = Object.keys(bin);
        if (CollectionUtils.isEmpty(keys)) {
            return undefined;
        }

        return keys[0];
    },

    /**
     * Returns the 'and-cli' config section for the currently executing package, or a default object.
     */
    getLocalAndCliConfigOrDefault() {
        let packageJson = this.getLocal();
        if (packageJson[Constants.CLI_NAME] == null) {
            return _defaultConfig;
        }

        // Return the 'and-cli' section merged with the default config structure if certain properties are not set
        return CoreUtils.merge(packageJson[Constants.CLI_NAME], _defaultConfig);
    },

    // #endregion Public Functions
};

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { PackageConfig };

// #endregion Exports
