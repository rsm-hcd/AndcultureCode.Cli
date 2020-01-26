/**************************************************************************************************
 * Imports
 **************************************************************************************************/
const { dotnetTest } = require("./cli-dotnet-test");
const dotnetBuild = require("./_modules/dotnet-build");
const dotnetClean = require("./_modules/dotnet-clean");


/**************************************************************************************************
 * Variables
 **************************************************************************************************/

describe("dotnetTest", () => {

    /**************************************************************************************************
     * runBySolution()
     **************************************************************************************************/

    describe("runBySolution()", () => {
        let dotnetBuildMock;

        beforeEach(() => {
            dotnetBuildMock = jest.spyOn(dotnetBuild, "run").mockImplementation(() => {});
        });

        test("it calls dotnetBuild.run() by default", () => {
            // Arrange & Act
            dotnetTest.runBySolution();

            // Assert
            expect(dotnetBuildMock).toHaveBeenCalledWith(true, true);
        });

        test("when skipClean is set to false, it calls dotnetBuild.run()", () => {
            // Arrange & Act
            dotnetTest.runBySolution(false);

            // Assert
            expect(dotnetBuildMock).toHaveBeenCalledWith(true, true);
        });

        test("when skipClean is set to true, it does not call dotnetBuild.run()", () => {
            // Arrange & Act
            dotnetTest.runBySolution(true);

            // Assert
            expect(dotnetBuildMock).not.toHaveBeenCalled();
        });
    });
});