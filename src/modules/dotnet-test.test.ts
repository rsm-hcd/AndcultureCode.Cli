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

    // -----------------------------------------------------------------------------------------
    // #region watchMode
    // -----------------------------------------------------------------------------------------

    describe("watchMode", () => {
        const defaultArgs = ["test", "--no-build", "--no-restore"];

        describe("when true", () => {
            it("it calls watch", () => {
                // Arrange
                const expected = ["watch", ...defaultArgs];
                const spawnSyncSpy = TestUtils.spyOnSpawnSync();

                // Act
                DotnetTest.watchMode(true).runBySolution();

                // Assert
                expect(spawnSyncSpy).toHaveBeenCalledWith(
                    expect.toBeString(),
                    expected,
                    expect.toBeObject()
                );
            });
        });

        describe("when false", () => {
            it("it does not call watch", () => {
                // Arrange
                const expected = [...defaultArgs];
                const spawnSyncSpy = TestUtils.spyOnSpawnSync();

                // Act
                DotnetTest.watchMode(false).runBySolution();

                // Assert
                expect(spawnSyncSpy).toHaveBeenCalledWith(
                    expect.toBeString(),
                    expected,
                    expect.toBeObject()
                );
            });
        });
    });

    // #endregion watchMode
});

// #endregion Tests
