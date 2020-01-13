/**************************************************************************************************
 * Imports
 **************************************************************************************************/
const cli_nuget = require("./cli-nuget");
const shell     = require("shelljs");


/**************************************************************************************************
 * Variables
 **************************************************************************************************/
const sut = cli_nuget.nugetUpgrade;

describe("nugetUpgrade", () => {

    let shellExitSpy;

    beforeEach(() => {
        shellExitSpy = jest.spyOn(shell, "exit").mockImplementation(() => {});
    });

    /**************************************************************************************************
     * replacePackageVersion()
     **************************************************************************************************/

    describe("replacePackageVersion()", () => {
        test("when shell.sed returns non-zero exit code, it calls shell.exit with that code", () => {
            // Arrange
            const shellSedMock = jest.fn().mockImplementation(() => {
                return { code: -1 };
            });
            shell.sed = shellSedMock;

            // Act
            sut.replacePackageVersion();

            // Assert
            expect(shell.exit).toHaveBeenCalledWith(-1);
        });

        test("when shell.sed returns zero exit code, it calls shell.exit code 0", () => {
            // Arrange
            const shellSedMock = jest.fn().mockImplementation(() => {
                return { code: 0 };
            });
            shell.sed = shellSedMock;

            // Act
            sut.replacePackageVersion();

            // Assert
            expect(shell.exit).toHaveBeenCalledWith(0);
        });
    });

    /**************************************************************************************************
     * validatePackageName()
     **************************************************************************************************/

    describe("validatePackageName()", () => {
        test.each`
            packageName
            ${undefined}
            ${null}
            ${""}
            ${" "}
        `("when given '$packageName' as a package name, it calls shell.exit", ({ packageName }) => {
            // Arrange & Act
            sut.validatePackageName(packageName);

            // Assert
            expect(shellExitSpy).toHaveBeenCalledWith(-1);
        });

        test("when given a string with >= 1 characters, it does not call shell.exit", () => {
            // Arrange & Act
            sut.validatePackageName("AutoMapper");

            // Assert
            expect(shellExitSpy).not.toHaveBeenCalled();
        });
    });

    describe("validatePackageVersion()", () => {
        test.each`
            packageVersion
            ${undefined}
            ${null}
            ${""}
            ${" "}
            ${"1"}
            ${"1.0"}
            ${"1.0.x"}
            ${"red"}
        `("when given '$packageVersion' as a package version, it calls shell.exit", ({ packageVersion }) => {
            // Arrange & Act
            sut.validatePackageVersion(packageVersion);

            // Assert
            expect(shellExitSpy).toHaveBeenCalledWith(-1);
        });

        test.each`
            packageVersion
            ${"1.0.1"}
            ${"6.11.1231"}
            ${"4.3.1-rc"}
            ${"2.2.44-beta1"}
        `("when given a valid semver '$packageVersion', it does not call shell.exit", ({ packageVersion }) => {
            // Arrange & Act
            sut.validatePackageVersion(packageVersion);

            // Assert
            expect(shellExitSpy).not.toHaveBeenCalled();
        });
    });
});