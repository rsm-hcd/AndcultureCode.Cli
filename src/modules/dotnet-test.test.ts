import { TestUtils } from "../tests/test-utils";
import { DotnetBuild } from "./dotnet-build";
import { DotnetTest } from "./dotnet-test";

// -----------------------------------------------------------------------------------------
// #region Mocks
// -----------------------------------------------------------------------------------------

jest.mock("path");

// #endregion Mocks

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("DotnetTest", () => {
    // -----------------------------------------------------------------------------------------
    // #region runBySolution
    // -----------------------------------------------------------------------------------------

    describe("runBySolution", () => {
        let dotnetBuildSpy: jest.SpyInstance;

        beforeEach(() => {
            dotnetBuildSpy = jest
                .spyOn(DotnetBuild, "run")
                .mockImplementation();
            TestUtils.spyOnShellExit();
        });

        test("it calls dotnetBuild.run() by default", () => {
            // Arrange & Act
            DotnetTest.runBySolution();

            // Assert
            expect(dotnetBuildSpy).toHaveBeenCalledWith(true, true);
        });

        test("when skipClean is set to false, it calls dotnetBuild.run()", () => {
            // Arrange & Act
            DotnetTest.skipClean(false).runBySolution();

            // Assert
            expect(dotnetBuildSpy).toHaveBeenCalledWith(true, true);
        });

        test("when skipClean is set to true, it does not call dotnetBuild.run()", () => {
            // Arrange & Act
            DotnetTest.skipClean(true).runBySolution();

            // Assert
            expect(dotnetBuildSpy).not.toHaveBeenCalled();
        });
    });

    // #endregion runBySolution
});

// #endregion Tests
