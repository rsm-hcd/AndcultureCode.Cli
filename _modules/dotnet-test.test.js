// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const dotnetBuild = require("./dotnet-build");
const dotnetTest  = require("./dotnet-test");
const shell       = require("shelljs");
const testUtils = require("../tests/test-utils");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Mocks
// -----------------------------------------------------------------------------------------

jest.mock("./dir");
jest.mock("path");

// #endregion Mocks

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------


describe("dotnetTest", () => {

    if (testUtils.isCI()) {
        test.skip("Test suite skipped in CI until we resolve https://travis-ci.community/t/not-able-to-install-net-core-3/5562/5", () => {});
        return;
    }

    // -----------------------------------------------------------------------------------------
    // #region runBySolution
    // -----------------------------------------------------------------------------------------

    describe("runBySolution", () => {
        let dotnetBuildSpy;

        beforeEach(() => {
            dotnetBuildSpy = jest.spyOn(dotnetBuild, "run").mockImplementation(() => { });
            jest.spyOn(shell, "exit").mockImplementation(() => { });
        });

        test("it calls dotnetBuild.run() by default", () => {
            // Arrange & Act
            dotnetTest.runBySolution();

            // Assert
            expect(dotnetBuildSpy).toHaveBeenCalledWith(true, true);
        });

        test("when skipClean is set to false, it calls dotnetBuild.run()", () => {
            // Arrange & Act
            dotnetTest.skipClean(false).runBySolution();

            // Assert
            expect(dotnetBuildSpy).toHaveBeenCalledWith(true, true);
        });

        test("when skipClean is set to true, it does not call dotnetBuild.run()", () => {
            // Arrange & Act
            dotnetTest.skipClean(true).runBySolution();

            // Assert
            expect(dotnetBuildSpy).not.toHaveBeenCalled();
        });
    });

    // #endregion runBySolution
});

// #endregion Tests
