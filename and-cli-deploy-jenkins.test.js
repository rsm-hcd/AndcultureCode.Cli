// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const { ERROR_OUTPUT_STRING } = require("./modules/constants");
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

    // -----------------------------------------------------------------------------------------
    // #region build
    // -----------------------------------------------------------------------------------------

    describe("build", () => {

        it('when --profile is empty then returns errors', () => {
            // Act
            const result = await testUtils.executeCliCommand("deploy", ["jenkins"]);

            // Assert
            expect(result).toContain(ERROR_OUTPUT_STRING);
            expect(result).toContain("--profile");
        })

        it('when profile does not exist then exits with errors', () => {

        })

        it('when tag is empty, then exits with errors', () => {

        })


        it('when validation fails then exits with errors', () => {

        })

        it('when validation passes and user accepts prompt then ', () => {

        })






    });

    // #endregion build

    // -----------------------------------------------------------------------------------------
    // #region init
    // -----------------------------------------------------------------------------------------

    describe("init", () => {});

    // #endregion init

    // -----------------------------------------------------------------------------------------
    // #region login
    // -----------------------------------------------------------------------------------------

    describe("login", () => {});

    // #endregion login
});

// #endregion Tests
