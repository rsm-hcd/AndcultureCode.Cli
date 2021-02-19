import { Factory } from "rosie";
import { WebpackRestoreOptions } from "../../interfaces/webpack-restore-options";
import { FactoryType } from "./factory-type";

// -------------------------------------------------------------------------------------------------
// #region Factory
// -------------------------------------------------------------------------------------------------

const WebpackRestoreOptionsFactory = Factory.define<WebpackRestoreOptions>(
    FactoryType.WebpackRestoreOptions
).attrs({
    ci: undefined,
    skipClean: undefined,
    skipRestore: undefined,
});

// #endregion Factory

// -------------------------------------------------------------------------------------------------
// #region Exports
// -------------------------------------------------------------------------------------------------

export { WebpackRestoreOptionsFactory };

// #endregion Exports
