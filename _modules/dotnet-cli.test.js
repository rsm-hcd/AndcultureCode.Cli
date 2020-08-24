// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------
const child_process = require("child_process");
const dotnetCli     = require("./dotnet-cli");
const shell         = require("shelljs");
const dotnetPath    = require("./dotnet-path");
const dotnetBuild   = require("./dotnet-build");
const faker         = require("faker");

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
        const dotnetPathSpy  = jest.spyOn(dotnetPath,  "cliDir").mockImplementation(() => undefined);
        const dotnetBuildSpy = jest.spyOn(dotnetBuild, "run").mockImplementation();

         // Act
         dotnetCli.run();

         // Assert
         expect(dotnetPathSpy).toHaveBeenCalled();
         expect(dotnetBuildSpy).toHaveBeenCalled();
    });

    //TODO: test if spawn sync returns a non 0 status
    // it calls shell.exit with the status
    test(`when spawn.sync returns non 0 it calls shell.exit with the status`, () => {
      // Arrange
      const exitCode  = faker.random.number({ min: 1 });
      const spawnSync = jest.spyOn(child_process, "spawnSync").mockImplementation(() => {
        return {status: exitCode};
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
