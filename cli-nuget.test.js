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
     * validatePackageName()
     **************************************************************************************************/

    describe("validatePackageName()", () => {
        test.each`
            input
            ${undefined}
            ${null}
            ${""}
            ${" "}
        `("when given '$input' as a package name, it calls shell.exit", ({ packageName }) => {
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
});