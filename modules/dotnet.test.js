// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const dotnet = require("./dotnet");
const dotnetClean = require("./dotnet-clean");
const dotnetPath = require("./dotnet-path");
const dotnetRestore = require("./dotnet-restore");
const faker = require("faker");
const testUtils = require("../tests/test-utils");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("dotnet", () => {
    let dotnetCleanSpy;
    let dotnetPathSpy;
    let dotnetRestoreSpy;
    let shellExitSpy;

    beforeEach(() => {
        dotnetCleanSpy = jest.spyOn(dotnetClean, "run").mockImplementation();
        dotnetPathSpy = jest
            .spyOn(dotnetPath, "solutionPathOrExit")
            .mockImplementation();
        dotnetRestoreSpy = jest
            .spyOn(dotnetRestore, "run")
            .mockImplementation();
        shellExitSpy = testUtils.spyOnShellExit();
    });

    // -----------------------------------------------------------------------------------------
    // #region run
    // -----------------------------------------------------------------------------------------

    describe("run", () => {
        test("it verifies the dotnet solution can be found by calling dotnetPath module", () => {
            // Arrange & Act
            dotnet.run();

            // Assert
            expect(dotnetPathSpy).toHaveBeenCalled();
        });

        test("when 'clean' is true, it calls dotnetClean module", () => {
            // Arrange & Act
            dotnet.setClean(true).run();

            // Assert
            expect(dotnetCleanSpy).toHaveBeenCalled();
        });

        test("when 'restore' is true, it calls dotnetRestore module", () => {
            // Arrange & Act
            dotnet.setRestore(true).run();

            // Assert
            expect(dotnetRestoreSpy).toHaveBeenCalled();
        });

        test("when dotnet command returns non-zero exit code, it calls shell.exit with that code", () => {
            // Arrange
            const exitCode = faker.random.number({ min: 1 });
            const spawnSyncSpy = testUtils.spyOnSpawnSync(exitCode);

            // Act
            dotnet.run();

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalled();
            expect(shellExitSpy).toHaveBeenCalledWith(exitCode);
        });
    });

    // #endregion run
});

// #endregion Tests
