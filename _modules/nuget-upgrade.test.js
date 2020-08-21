// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const faker = require("faker");
const nugetUpgrade = require("./nuget-upgrade");
const path = require("path");
const shell = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("nugetUpgrade", () => {
    const mockShellFn = (code = 0, stdout = "") =>
        jest.fn().mockImplementation(() => {
            return { code, stdout };
        });

    let shellExitSpy;

    beforeEach(() => {
        shellExitSpy = jest.spyOn(shell, "exit").mockImplementation(() => {});
    });

    // -----------------------------------------------------------------------------------------
    // #region findCsprojFiles
    // -----------------------------------------------------------------------------------------

    describe("findCsprojFiles", () => {
        test("when shell.find returns non-zero exit code, it calls shell.exit with that code", () => {
            // Arrange
            const mockReturnCode = faker.random.number({ min: 1 });
            const mockDirname = faker.random.word();
            jest.spyOn(shell, "find").mockImplementation(
                mockShellFn(mockReturnCode)
            );
            jest.spyOn(path, "dirname").mockImplementation(() => mockDirname);

            // Act
            nugetUpgrade.findCsprojFiles();

            // Assert
            expect(shellExitSpy).toHaveBeenCalledWith(mockReturnCode);
        });
    });

    // #endregion findCsprojFiles

    // -----------------------------------------------------------------------------------------
    // #region getCsprojFilesContainingPackage
    // -----------------------------------------------------------------------------------------

    describe("getCsprojFilesContainingPackage", () => {
        test("when shell.grep returns non-zero exit code, it calls shell.exit with that code", () => {
            // Arrange
            const mockReturnCode = faker.random.number({ min: 1 });
            jest.spyOn(shell, "grep").mockImplementation(
                mockShellFn(mockReturnCode)
            );

            // Act
            nugetUpgrade.getCsprojFilesContainingPackage([]);

            // Assert
            expect(shellExitSpy).toHaveBeenCalledWith(mockReturnCode);
        });

        test("when shell.grep returns zero exit code but no files with the package are found, it calls shell.exit with 1 exit code", () => {
            // Arrange
            jest.spyOn(shell, "grep").mockImplementation(mockShellFn(0));

            // Act
            nugetUpgrade.getCsprojFilesContainingPackage([]);

            // Assert
            expect(shellExitSpy).toHaveBeenCalledWith(1);
        });
    });

    // #endregion getCsprojFilesContainingPackage

    // -----------------------------------------------------------------------------------------
    // #region replacePackageVersion
    // -----------------------------------------------------------------------------------------

    describe("replacePackageVersion", () => {
        test("when shell.sed returns non-zero exit code, it calls shell.exit with that code", () => {
            // Arrange
            const mockReturnCode = faker.random.number({ min: 1 });
            jest.spyOn(shell, "sed").mockImplementation(
                mockShellFn(mockReturnCode)
            );

            // Act
            nugetUpgrade.replacePackageVersion();

            // Assert
            expect(shellExitSpy).toHaveBeenCalledWith(mockReturnCode);
        });

        test("when shell.sed returns zero exit code, it returns zero", () => {
            // Arrange
            jest.spyOn(shell, "sed").mockImplementation(mockShellFn(0));

            // Act
            const result = nugetUpgrade.replacePackageVersion();

            // Assert
            expect(result).toBe(0);
        });
    });

    // #endregion replacePackageVersion

    // -----------------------------------------------------------------------------------------
    // #region validatePackageName
    // -----------------------------------------------------------------------------------------

    describe("validatePackageName", () => {
        test.each`
            packageName
            ${""}
            ${" "}
        `(
            "when given '$packageName' as a package name, it calls shell.exit with non-zero code",
            ({ packageName }) => {
                // Arrange & Act
                nugetUpgrade.validatePackageName(packageName);

                // Assert
                expect(shellExitSpy).toHaveBeenCalledWith(1);
            }
        );

        test("when given a string with >= 1 characters, it does not call shell.exit", () => {
            // Arrange & Act
            nugetUpgrade.validatePackageName("AutoMapper");

            // Assert
            expect(shellExitSpy).not.toHaveBeenCalled();
        });
    });

    // #endregion validatePackageName

    // -----------------------------------------------------------------------------------------
    // #region validatePackageVersion
    // -----------------------------------------------------------------------------------------

    describe("validatePackageVersion", () => {
        test.each`
            packageVersion
            ${""}
            ${" "}
            ${"1"}
            ${"1.0"}
            ${"1.0.x"}
            ${"red"}
        `(
            "when given '$packageVersion' as a package version, it calls shell.exit",
            ({ packageVersion }) => {
                // Arrange & Act
                nugetUpgrade.validatePackageVersion(packageVersion);

                // Assert
                expect(shellExitSpy).toHaveBeenCalledWith(1);
            }
        );

        test.each`
            packageVersion
            ${"1.0.1"}
            ${"6.11.1231"}
            ${"4.3.1-rc"}
            ${"2.2.44-beta1"}
        `(
            "when given a valid semver '$packageVersion', it does not call shell.exit",
            ({ packageVersion }) => {
                // Arrange & Act
                nugetUpgrade.validatePackageVersion(packageVersion);

                // Assert
                expect(shellExitSpy).not.toHaveBeenCalled();
            }
        );
    });

    // #endregion validatePackageVersion
});

// #endregion Tests
