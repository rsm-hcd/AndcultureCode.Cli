// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const { ERROR_OUTPUT_STRING } = require("./modules/constants");
const { getConfig } = require("./modules/jenkins");
const jenkins = require("./modules/jenkins");
const prompt = require("./modules/user-prompt");
const { shouldDisplayHelpMenu } = require("./tests/shared-specs");
const testUtils = require("./tests/test-utils");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("and-cli-deploy-jenkins", () => {
    // -----------------------------------------------------------------------------------------
    // #region help
    // -----------------------------------------------------------------------------------------

    shouldDisplayHelpMenu("and-cli-deploy-jenkins");

    // #endregion help
});

// #endregion Tests
