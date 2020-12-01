import { StringUtils } from "andculturecode-javascript-core";
import { Echo } from "../modules/echo";
import shell from "shelljs";
import { Formatters } from "../modules/formatters";

// -----------------------------------------------------------------------------------------
// #region Public Functions
// -----------------------------------------------------------------------------------------

class OptionStringBuilder {
    // -----------------------------------------------------------------------------------------
    // #region Public Members
    // -----------------------------------------------------------------------------------------

    public option: string;
    public shortFlag: string;

    // #endregion Public Members

    // -----------------------------------------------------------------------------------------
    // #region Constructor
    // -----------------------------------------------------------------------------------------

    /**
     * Constructor function to an `OptionStringBuilder` object based on the given option & short flag
     *
     * @param {string} [option=""] Full option or 'verbose' flag to trigger the option's behavior.
     * If not provided, it assumes the shortFlag or option will be set with subsequent function calls.
     * Note: "--" does not need to be provided, and will be stripped out.
     * @param {string} [shortFlag=""] Short flag to trigger the option's behavior.
     * If not provided, it assumes the option or shortFlag will be set with subsequent function calls.
     * Note: "-" does not need to be provided, and will be stripped out.
     * @returns {OptionStringBuilder}
     */
    constructor(option?: string, shortFlag?: string) {
        this.option = _transformOption(_stripDashes(option));
        this.shortFlag = _transformShortFlag(_stripDashes(shortFlag));
    }

    // #endregion Constructor

    // -----------------------------------------------------------------------------------------
    // #region Public Functions
    // -----------------------------------------------------------------------------------------

    public toArray(): string[] {
        _validateOrExit(this.option, this.shortFlag);
        return _buildArray(this.option, this.shortFlag);
    }

    public toString(): string {
        _validateOrExit(this.option, this.shortFlag);
        return this.toArray().join(", ");
    }

    public withOption(option: string): OptionStringBuilder {
        this.option = _transformOption(_stripDashes(option));
        return this;
    }

    public withShortFlag(shortFlag: string): OptionStringBuilder {
        this.shortFlag = _transformShortFlag(_stripDashes(shortFlag));
        return this;
    }

    // #endregion Public Functions
}

// #endregion Public Functions

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

const _buildArray = (option?: string, shortFlag?: string): string[] => {
    const optionsArray = [];
    if (StringUtils.hasValue(shortFlag)) {
        optionsArray.push(shortFlag!);
    }

    if (StringUtils.hasValue(option)) {
        optionsArray.push(option!);
    }

    return optionsArray;
};

const _transformOption = (option?: string): string => {
    if (StringUtils.isEmpty(option)) {
        return option ?? "";
    }

    return `--${option}`;
};

const _transformShortFlag = (shortFlag?: string): string => {
    if (StringUtils.isEmpty(shortFlag)) {
        return shortFlag ?? "";
    }

    return `-${shortFlag}`;
};

const _stripDashes = (input?: string): string => {
    if (StringUtils.isEmpty(input)) {
        return "";
    }

    // We know at this point that input has a value
    input = input!;

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
    shortFlag = _stripDashes(shortFlag);
    if (StringUtils.hasValue(shortFlag) && shortFlag.length > 1) {
        Echo.error(
            `Short flag can only be 1 character in length. Received: ${Formatters.red(
                shortFlag
            )}`
        );
        shell.exit(1);
    }
};

const _validateOrExit = (option = "", shortFlag = "") => {
    option = _stripDashes(option);
    shortFlag = _stripDashes(shortFlag);

    if (StringUtils.isEmpty(option) && StringUtils.isEmpty(shortFlag)) {
        Echo.error("Option or short flag is required");
        shell.exit(1);
    }

    _validateFlagOrExit(shortFlag);
};

// #endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { OptionStringBuilder };

// #endregion Exports
