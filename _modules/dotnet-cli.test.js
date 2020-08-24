// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const child_process = require("child_process");
const dotnetBuild = require("./dotnet-build");
const dotnetCli = require("./dotnet-cli");
const dotnetPath = require("./dotnet-path");
const faker = require("faker");
const shell = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("dotnetCli", () => {
    // -----------------------------------------------------------------------------------------
    // #region run
    // -----------------------------------------------------------------------------------------

    describe("run", () => {
        let shellExitSpy;
        beforeEach(() => {
            shellExitSpy = jest.spyOn(shell, "exit").mockImplementation();
        });

        test(`when dotnetPath.cliDir() path returns undefined it calls donetBuild.run`, () => {
            // Arrange
            const dotnetPathSpy = jest
                .spyOn(dotnetPath, "cliDir")
                .mockImplementation(() => undefined);
            const dotnetBuildSpy = jest
                .spyOn(dotnetBuild, "run")
                .mockImplementation();

            // Act
            dotnetCli.run();

            // Assert
            expect(dotnetPathSpy).toHaveBeenCalled();
            expect(dotnetBuildSpy).toHaveBeenCalled();
        });

        test(`when spawn.sync returns non 0 it calls shell.exit with the status`, () => {
            // Arrange
            const exitCode = faker.random.number({ min: 1 });
            const spawnSync = jest
                .spyOn(child_process, "spawnSync")
                .mockImplementation(() => {
                    return { status: exitCode };
                });

            // Act
            dotnetCli.run();

            // Assert
            expect(spawnSync).toHaveBeenCalled();
            expect(shellExitSpy).toHaveBeenCalledWith(exitCode);
        });
    });

    // #endregion run
});

// #endregion Tests
