// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const dotnetPath = require("./dotnet-path");
const dotnetClean = require("./dotnet-clean");
const faker = require("faker");
const shell = require("shelljs");
const testUtils = require("../tests/test-utils");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Mocks
// -----------------------------------------------------------------------------------------

// Mocking dir module to suppress lots of extra output from popd/pushd errors from lack of actual
// directory stack.
jest.mock("./dir");

// #endregion Mocks

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("dotnetClean", () => {
    let dotnetPathSpy;
    let shellExitSpy;

    beforeEach(() => {
        dotnetPathSpy = jest
            .spyOn(dotnetPath, "solutionPathOrExit")
            .mockImplementation();
        shellExitSpy = testUtils.spyOnShellExit();
    });

    // -----------------------------------------------------------------------------------------
    // #region run
    // -----------------------------------------------------------------------------------------
    describe("run", () => {
        test("it verifies the dotnet solution can be found by calling dotnetPath module", () => {
            // Arrange & Act
            dotnetClean.run();

            // Assert
            expect(dotnetPathSpy).toHaveBeenCalled();
        });

        test("when no 'bin' or 'obj' directories exist, it does not call shell.rm", () => {
            // Arrange
            const shellFindSpy = jest
                .spyOn(shell, "find")
                .mockImplementation(() => []);
            const shellRmSpy = jest.spyOn(shell, "rm");

            // Act
            dotnetClean.run();

            // Assert
            expect(shellFindSpy).toHaveBeenCalled();
            expect(shellRmSpy).not.toHaveBeenCalled();
        });

        test("when '.git' directory exists, it is not passed to shell.rm", () => {
            // Arrange
            const shellFindSpy = jest
                .spyOn(shell, "find")
                .mockImplementation(() => [".git", "bin", "obj"]);
            const shellRmSpy = jest.spyOn(shell, "rm");

            // Act
            dotnetClean.run();

            // Assert
            expect(shellFindSpy).toHaveBeenCalled();
            expect(shellRmSpy).toHaveBeenCalledWith("-rf", ["bin"]);
            expect(shellRmSpy).toHaveBeenCalledWith("-rf", ["obj"]);
        });

        test("when 'node_modules' directory exists, it is not passed to shell.rm", () => {
            // Arrange
            const shellFindSpy = jest
                .spyOn(shell, "find")
                .mockImplementation(() => ["node_modules", "bin", "obj"]);
            const shellRmSpy = jest.spyOn(shell, "rm");

            // Act
            dotnetClean.run();

            // Assert
            expect(shellFindSpy).toHaveBeenCalled();
            expect(shellRmSpy).toHaveBeenCalledWith("-rf", ["bin"]);
            expect(shellRmSpy).toHaveBeenCalledWith("-rf", ["obj"]);
        });

        test("when shell.rm fails to clean 'bin' directories, it calls shell.exit", () => {
            // Arrange
            jest.spyOn(shell, "find").mockImplementation(() => ["bin"]);
            const exitCode = faker.random.number({ min: 1 });
            const shellRmSpy = jest
                .spyOn(shell, "rm")
                .mockImplementation(() => {
                    return { code: exitCode };
                });

            // Act
            dotnetClean.run();

            // Assert
            expect(shellRmSpy).toHaveBeenCalled();
            expect(shellExitSpy).toHaveBeenCalledWith(exitCode);
        });

        test("when shell.rm fails to clean 'obj' directories, it calls shell.exit", () => {
            // Arrange
            jest.spyOn(shell, "find").mockImplementation(() => ["obj"]);
            const exitCode = faker.random.number({ min: 1 });
            const shellRmSpy = jest
                .spyOn(shell, "rm")
                .mockImplementation(() => {
                    return { code: exitCode };
                });

            // Act
            dotnetClean.run();

            // Assert
            expect(shellRmSpy).toHaveBeenCalled();
            expect(shellExitSpy).toHaveBeenCalledWith(exitCode);
        });

        test(`when '${dotnetClean.cmd()}' fails, it calls shell.exit`, () => {
            // Arrange
            jest.spyOn(shell, "find").mockImplementation(() => []);
            jest.spyOn(shell, "rm").mockImplementation();
            const exitCode = faker.random.number({ min: 1 });
            const spawnSyncSpy = testUtils.spyOnSpawnSync(exitCode);

            // Act
            dotnetClean.run();

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalled();
            expect(shellExitSpy).toHaveBeenCalledWith(exitCode);
        });
    });

    // #endregion run
});

// #endregion Tests
