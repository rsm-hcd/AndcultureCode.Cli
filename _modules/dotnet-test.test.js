/**************************************************************************************************
 * Imports
 **************************************************************************************************/
const dotnetBuild = require("./dotnet-build");
const dotnetTest  = require("./dotnet-test");
const shell       = require("shelljs");

/**************************************************************************************************
 * Mocks
 **************************************************************************************************/
jest.mock("./dir");
// Mocking the echo module explicitly to suppress extra output from the module.
jest.mock("./echo");
jest.mock("path");

describe("dotnetTest", () => {

    /**************************************************************************************************
     * runBySolution()
     **************************************************************************************************/

    describe("runBySolution()", () => {
        let dotnetBuildSpy;

        beforeEach(() => {
            dotnetBuildSpy = jest.spyOn(dotnetBuild, "run").mockImplementation(() => {});
            jest.spyOn(shell, "exit").mockImplementation(() => {});
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
});
