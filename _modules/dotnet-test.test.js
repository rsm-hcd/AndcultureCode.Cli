// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const dotnetBuild = require("./dotnet-build");
const dotnetTest  = require("./dotnet-test");
const shell       = require("shelljs");

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

    // -----------------------------------------------------------------------------------------
    // #region runBySolution
    // -----------------------------------------------------------------------------------------

    describe("runBySolution", () => {
        let dotnetBuildSpy;

        beforeEach(() => {
            dotnetBuildSpy = jest.spyOn(dotnetBuild, "run").mockImplementation(() => { });
            jest.spyOn(shell, "exit").mockImplementation(() => { });
        });

        test.skip("it calls dotnetBuild.run() by default", () => {
            // Arrange & Act
            dotnetTest.runBySolution();

            // Assert
            expect(dotnetBuildSpy).toHaveBeenCalledWith(true, true);
        });

        test.skip("when skipClean is set to false, it calls dotnetBuild.run()", () => {
            // Arrange & Act
            dotnetTest.skipClean(false).runBySolution();

            // Assert
            expect(dotnetBuildSpy).toHaveBeenCalledWith(true, true);
        });

        test.skip("when skipClean is set to true, it does not call dotnetBuild.run()", () => {
            // Arrange & Act
            dotnetTest.skipClean(true).runBySolution();

            // Assert
            expect(dotnetBuildSpy).not.toHaveBeenCalled();
        });
    });

    // #endregion runBySolution
});

// #endregion Tests
