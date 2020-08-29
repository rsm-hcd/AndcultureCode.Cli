// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const child_process = require("child_process");
const dotnetBuild = require("./dotnet-build");
const dotnetCli = require("./dotnet-cli");
const dotnetPath = require("./dotnet-path");
const faker = require("faker");
const path = require("path");
const shell = require("shelljs");
const testUtils = require("../tests/test-utils");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("dotnetCli", () => {
    // -----------------------------------------------------------------------------------------
    // #region cmd
    // -----------------------------------------------------------------------------------------

    describe("cmd", () => {
        test("given a string array of arguments, it returns a properly command string to the Cli executable", () => {
            // Arrange
            const cliPath = testUtils.randomFile();
            const cliArgs = faker.random.words(3).split(" ");
            jest.spyOn(dotnetPath, "cliPath").mockImplementation(() => cliPath);
            const expectedString = `dotnet ${cliPath} ${cliArgs.join(" ")}`;

            // Act
            const result = dotnetCli.cmd(cliArgs).toString();

            // Assert
            expect(result).toBe(expectedString);
        });
    });

    // #endregion cmd

    // -----------------------------------------------------------------------------------------
    // #region run
    // -----------------------------------------------------------------------------------------

    describe("run", () => {
        let shellExitSpy;
        beforeEach(() => {
            shellExitSpy = jest.spyOn(shell, "exit").mockImplementation();
        });

        test("when dotnetPath.cliPath returns undefined, it calls dotnetBuild.run", () => {
            // Arrange
            const dotnetPathSpy = jest
                .spyOn(dotnetPath, "cliPath")
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

        test("when child_process.spawnSync returns non-zero status, it calls shell.exit with the status", () => {
            // Arrange
            const exitCode = testUtils.randomNumber(1);
            const spawnSync = testUtils.spyOnSpawnSync(exitCode);

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
