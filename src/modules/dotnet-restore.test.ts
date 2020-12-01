import { TestUtils } from "../tests/test-utils";
import { DotnetPath } from "./dotnet-path";
import { DotnetRestore } from "./dotnet-restore";
import faker from "faker";
import child_process from "child_process";

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("DotnetRestore", () => {
    let dotnetPathSpy: jest.SpyInstance;
    let shellExitSpy: jest.SpyInstance;

    beforeEach(() => {
        dotnetPathSpy = jest
            .spyOn(DotnetPath, "solutionPathOrExit")
            .mockImplementation();
        shellExitSpy = TestUtils.spyOnShellExit();
    });

    // -----------------------------------------------------------------------------------------
    // #region run
    // -----------------------------------------------------------------------------------------

    describe("run", () => {
        test("it verifies the dotnet solution can be found by calling DotnetPath module", () => {
            // Arrange & Act
            DotnetRestore.run();

            // Assert
            expect(dotnetPathSpy).toHaveBeenCalled();
        });

        test("when dotnet command returns non-zero exit code, it calls shell.exit with that code", () => {
            // Arrange
            const exitCode = faker.random.number({ min: 1 });
            TestUtils.spyOnSpawnSync(exitCode);

            // Act
            DotnetRestore.run();

            // Assert
            expect(shellExitSpy).toHaveBeenCalledWith(exitCode);
        });
    });

    // #endregion run
});

// #endregion Tests
