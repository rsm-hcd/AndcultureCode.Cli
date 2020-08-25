// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const { StringUtils } = require("andculturecode-javascript-core");
const echo = require("../modules/echo");
const shell = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

const _buildArray = (option, shortFlag) => {
    const optionsArray = [];
    if (StringUtils.hasValue(shortFlag)) {
        optionsArray.push(shortFlag);
    }

    if (StringUtils.hasValue(option)) {
        optionsArray.push(option);
    }

    return optionsArray;
};

const _transformOption = (option) => {
    if (StringUtils.isEmpty(option)) {
        return option;
    }

    return `--${option}`;
};

const _transformShortFlag = (shortFlag) => {
    if (StringUtils.isEmpty(shortFlag)) {
        return shortFlag;
    }

    return `-${shortFlag}`;
};

/**
 * String-like object with 'option' and 'shortFlag' properties for ease of use with `program.option`
 *
 * @see option-string-type.ts
 * @class OptionString
 * @extends {String}
 */
class OptionString extends String {
    constructor(option, shortFlag) {
        option = _transformOption(option);
        shortFlag = _transformShortFlag(shortFlag);

        const arrayValue = _buildArray(option, shortFlag);
        const stringValue = arrayValue.join(", ");

        super(stringValue);

        this.option = option;
        this.shortFlag = shortFlag;

        /**
         * Builds an array containing options/flags for a command, ie ["-b", "--build"]
         *
         * If no short flag has been specified, only the option will be returned. Inversely,
         * if no option has been specified, only the short flag will be returned.
         *
         * @returns Array with the configured flag, option, or both.
         */
        this.toArray = () => arrayValue;
    }
}

const _sanitizeInput = (input = "") => {
    if (StringUtils.isEmpty(input)) {
        return input;
    }

    // Strip out any dashes from the incoming option/shortFlag
    if (input.startsWith("--")) {
        return input.replace(/--/, "");
    }

    if (input.startsWith("-")) {
        return input.replace(/-/, "");
    }

    return input;
};

const _validateFlagOrExit = (shortFlag = "") => {
    if (StringUtils.hasValue(shortFlag) && shortFlag.length > 1) {
        echo.error("Short flag can only be 1 character in length.");
        shell.exit(1);
    }
};

const _validateOrExit = (option = "", shortFlag = "") => {
    if (StringUtils.isEmpty(option) && StringUtils.isEmpty(shortFlag)) {
        echo.error("Option or short flag is required");
        shell.exit(1);
    }

    _validateFlagOrExit(shortFlag);
};

// #endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Public Functions
// -----------------------------------------------------------------------------------------

const optionStringFactory = {
    /**
     * Factory function to return an `OptionString` object based on the given option & short flag
     *
     *
     * @param {string} [option=""] Full option or 'verbose' flag to trigger the option's behavior.
     * If not provided, it assumes `shortFlag` will be provided instead. Note: "--" does not
     * need to be provided, and will be stripped out.
     * @param {string} [shortFlag=""] Short flag to trigger the option's behavior.
     * If not provided, it assumes `option` will be provided instead. Note: "-" does not
     * need to be provided,  and will be stripped out.
     * @returns {OptionString}
     */
    build(option = "", shortFlag = "") {
        option = _sanitizeInput(option);
        shortFlag = _sanitizeInput(shortFlag);

        _validateOrExit(option, shortFlag);

        return new OptionString(option, shortFlag);
    },
};

// #endregion Public Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = optionStringFactory;

// #endregion Exports
