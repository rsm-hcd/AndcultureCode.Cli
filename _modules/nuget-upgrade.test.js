// /**************************************************************************************************
//  * Imports
//  **************************************************************************************************/
// const { nugetUpgrade } = require("./cli-nuget");
// const shell            = require("shelljs");


// /**************************************************************************************************
//  * Variables
//  **************************************************************************************************/

// describe("nugetUpgrade", () => {
//     const mockShellFn = (code = 0, stdout = "") => jest.fn().mockImplementation(() => {
//         return { code, stdout };
//     });

//     let shellExitSpy;

//     beforeEach(() => {
//         shellExitSpy = jest.spyOn(shell, "exit").mockImplementation(() => {});
//     });

//     /**************************************************************************************************
//      * findCsprojFiles()
//      **************************************************************************************************/

//     describe("findCsprojFiles()", () => {
//         test("when shell.find returns non-zero exit code, it calls shell.exit with that code", () => {
//             // Arrange
//             shell.find = mockShellFn(1);

//             // Act
//             nugetUpgrade.findCsprojFiles();

//             // Assert
//             expect(shell.exit).toHaveBeenCalledWith(1);
//         });
//     });

//     /**************************************************************************************************
//      * getCsprojFilesContainingPackage()
//      **************************************************************************************************/

//     describe("getCsprojFilesContainingPackage()", () => {
//         test("when shell.grep returns non-zero exit code, it calls shell.exit with that code", () => {
//             // Arrange
//             shell.grep = mockShellFn(100);

//             // Act
//             nugetUpgrade.getCsprojFilesContainingPackage([]);

//             // Assert
//             expect(shell.exit).toHaveBeenCalledWith(100);
//         });

//         test("when shell.grep returns zero exit code but no files with the package are found, it calls shell.exit with 1 exit code", () => {
//             // Arrange
//             shell.grep = mockShellFn(0);

//             // Act
//             nugetUpgrade.getCsprojFilesContainingPackage([]);

//             // Assert
//             expect(shell.exit).toHaveBeenCalledWith(1);
//         });
//     });

//     /**************************************************************************************************
//      * replacePackageVersion()
//      **************************************************************************************************/

//     describe("replacePackageVersion()", () => {
//         test("when shell.sed returns non-zero exit code, it calls shell.exit with that code", () => {
//             // Arrange
//             shell.sed = mockShellFn(1);

//             // Act
//             nugetUpgrade.replacePackageVersion();

//             // Assert
//             expect(shell.exit).toHaveBeenCalledWith(1);
//         });

//         test("when shell.sed returns zero exit code, it calls shell.exit with code zero", () => {
//             // Arrange
//             shell.sed = mockShellFn(0);

//             // Act
//             nugetUpgrade.replacePackageVersion();

//             // Assert
//             expect(shell.exit).toHaveBeenCalledWith(0);
//         });
//     });

//     /**************************************************************************************************
//      * validatePackageName()
//      **************************************************************************************************/

//     describe("validatePackageName()", () => {
//         test.each`
//             packageName
//             ${""}
//             ${" "}
//         `("when given '$packageName' as a package name, it calls shell.exit with non-zero code", ({ packageName }) => {
//             // Arrange & Act
//             nugetUpgrade.validatePackageName(packageName);

//             // Assert
//             expect(shellExitSpy).toHaveBeenCalledWith(1);
//         });

//         test("when given a string with >= 1 characters, it does not call shell.exit", () => {
//             // Arrange & Act
//             nugetUpgrade.validatePackageName("AutoMapper");

//             // Assert
//             expect(shellExitSpy).not.toHaveBeenCalled();
//         });
//     });

//     describe("validatePackageVersion()", () => {
//         test.each`
//             packageVersion
//             ${""}
//             ${" "}
//             ${"1"}
//             ${"1.0"}
//             ${"1.0.x"}
//             ${"red"}
//         `("when given '$packageVersion' as a package version, it calls shell.exit", ({ packageVersion }) => {
//             // Arrange & Act
//             nugetUpgrade.validatePackageVersion(packageVersion);

//             // Assert
//             expect(shellExitSpy).toHaveBeenCalledWith(1);
//         });

//         test.each`
//             packageVersion
//             ${"1.0.1"}
//             ${"6.11.1231"}
//             ${"4.3.1-rc"}
//             ${"2.2.44-beta1"}
//         `("when given a valid semver '$packageVersion', it does not call shell.exit", ({ packageVersion }) => {
//             // Arrange & Act
//             nugetUpgrade.validatePackageVersion(packageVersion);

//             // Assert
//             expect(shellExitSpy).not.toHaveBeenCalled();
//         });
//     });
// });