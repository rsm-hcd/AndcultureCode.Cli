// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const faker = require("faker");
const file = require("./file");
const path = require("path");
const shell = require("shelljs");
const upath = require("upath");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("dotnetPath", () => {
    let dotnetPath;
    let mockFilePath;
    let releaseDir;
    let cliFilePath;

    beforeEach(() => {
        mockFilePath = faker.random.word();

        // Due to the way the dotnetPath module caches values, we need to isolate the module in each
        // test to prevent side effects and test behavior properly.
        // See https://stackoverflow.com/questions/48989643/how-to-reset-module-imported-between-tests
        jest.isolateModules(() => {
            dotnetPath = require("./dotnet-path");

            cliFilePath = dotnetPath.CLI_FILE_PATH;
            releaseDir = dotnetPath.RELEASE_DIRECTORY;
        });
    });

    // -----------------------------------------------------------------------------------------
    // #region cliDir
    // -----------------------------------------------------------------------------------------

    describe("cliDir", () => {
        test.each([undefined, null])(
            "when cliPath() returns %p, it returns undefined",
            (returnValue) => {
                // Arrange
                const cliPathSpy = jest
                    .spyOn(dotnetPath, "cliPath")
                    .mockImplementation(() => returnValue);

                // Act
                const result = dotnetPath.cliDir();

                // Assert
                expect(cliPathSpy).toHaveBeenCalledTimes(1);
                expect(result).toBeUndefined();
            }
        );

        test("when cliPath() returns a value, it calls path.dirname", () => {
            // Arrange
            const cliPathSpy = jest
                .spyOn(dotnetPath, "cliPath")
                .mockImplementation(() => mockFilePath);

            // Act
            const result = dotnetPath.cliDir();

            // Assert
            expect(cliPathSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual(path.dirname(mockFilePath));
        });
    });

    // #endregion cliDir

    // -----------------------------------------------------------------------------------------
    // #region cliPath
    // -----------------------------------------------------------------------------------------

    describe("cliPath", () => {
        test.each([undefined, null])(
            "when solutionDir() returns %p, it returns undefined",
            (returnValue) => {
                // Arrange
                const solutionDirSpy = jest
                    .spyOn(dotnetPath, "solutionDir")
                    .mockImplementation(() => returnValue);

                // Act
                const result = dotnetPath.cliPath();

                // Assert
                expect(solutionDirSpy).toHaveBeenCalledTimes(1);
                expect(result).toBeUndefined();
            }
        );

        test(`when solutionDir has a value, it calls file.first with <solutionDir>/${cliFilePath}`, () => {
            // Arrange
            jest.spyOn(dotnetPath, "solutionDir").mockImplementation(
                () => mockFilePath
            );
            const fileFirstSpy = jest.spyOn(file, "first").mockImplementation();
            const expectedPath = upath.toUnix(
                path.join(mockFilePath, dotnetPath.CLI_FILE_PATH)
            );

            // Act
            dotnetPath.cliPath();

            // Assert
            expect(fileFirstSpy).toHaveBeenCalledWith(expectedPath);
        });

        test("when called consecutively, it returns the cached value", () => {
            // Arrange
            jest.spyOn(dotnetPath, "solutionDir").mockImplementation(
                () => mockFilePath
            );
            const fileFirstSpy = jest
                .spyOn(file, "first")
                .mockImplementation(() => mockFilePath);

            // Act
            const result1 = dotnetPath.cliPath();
            const result2 = dotnetPath.cliPath();

            // Assert
            // file.first() should only be called once, and the cached variable should be returned
            // on the second call to cliPath()
            expect(fileFirstSpy).toHaveBeenCalledTimes(1);
            expect(result1).toBe(mockFilePath);
            expect(result2).toBe(mockFilePath);
        });
    });

    // #endregion cliPath

    // -----------------------------------------------------------------------------------------
    // #region dataProjectFilePath
    // -----------------------------------------------------------------------------------------

    describe("dataProjectFilePath", () => {
        test("when file.first returns a non-null value, it returns that value", () => {
            // Arrange
            const fileFirstSpy = jest
                .spyOn(file, "first")
                .mockImplementation(() => mockFilePath);

            // Act
            const result = dotnetPath.dataProjectFilePath();

            // Assert
            expect(fileFirstSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockFilePath);
        });

        test.each([undefined, null])(
            "when file.first returns %p, it returns undefined",
            (returnValue) => {
                // Arrange
                // If file.first only ever returns null/undefined, it means the current directory has
                // no matching files/subdirectories.
                const fileFirstSpy = jest
                    .spyOn(file, "first")
                    .mockImplementation(() => returnValue);

                // Act
                const result = dotnetPath.dataProjectFilePath();

                // Assert
                expect(fileFirstSpy).toHaveBeenCalled();
                expect(result).toBeUndefined();
            }
        );

        test("when file.first is called multiple times, it returns the first non-null value", () => {
            // Arrange
            const expectedFile = mockFilePath;
            const unexpectedFile = `unexpected-${mockFilePath}`;
            const fileFirstSpy = jest
                .spyOn(file, "first")
                .mockImplementationOnce(() => undefined)
                .mockImplementationOnce(() => null)
                .mockImplementationOnce(() => expectedFile)
                .mockImplementationOnce(() => unexpectedFile);

            // Act
            const result = dotnetPath.dataProjectFilePath();

            // Assert
            expect(fileFirstSpy).toHaveBeenCalledTimes(3);
            expect(result).toBe(expectedFile);
        });

        test("when called consecutively, it returns the cached value", () => {
            // Arrange
            const fileFirstSpy = jest
                .spyOn(file, "first")
                .mockImplementation(() => mockFilePath);

            // Act
            const result1 = dotnetPath.dataProjectFilePath();
            const result2 = dotnetPath.dataProjectFilePath();

            // Assert
            // file.first() should only be called once, and the cached variable should be returned
            // on the second call to dataProjectFilePath()
            expect(fileFirstSpy).toHaveBeenCalledTimes(1);
            expect(result1).toBe(mockFilePath);
            expect(result2).toBe(mockFilePath);
        });
    });

    // #endregion dataProjectFilePath

    // -----------------------------------------------------------------------------------------
    // #region dataProjectFilePathOrExit
    // -----------------------------------------------------------------------------------------

    describe("dataProjectFilePathOrExit", () => {
        test("when dataProjectFilePath() returns a value, it returns that value", () => {
            // Arrange
            const dataProjectFilePathSpy = jest
                .spyOn(dotnetPath, "dataProjectFilePath")
                .mockImplementation(() => mockFilePath);

            // Act
            const result = dotnetPath.dataProjectFilePathOrExit();

            // Assert
            expect(dataProjectFilePathSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockFilePath);
        });

        test.each([undefined, null])(
            "when dataProjectFilePath() returns %p, it calls shell.exit",
            (returnValue) => {
                // Arrange
                const dataProjectFilePathSpy = jest
                    .spyOn(dotnetPath, "dataProjectFilePath")
                    .mockImplementation(() => returnValue);
                const shellExitSpy = jest
                    .spyOn(shell, "exit")
                    .mockImplementation();

                // Act
                dotnetPath.dataProjectFilePathOrExit();

                // Assert
                expect(dataProjectFilePathSpy).toHaveBeenCalledTimes(1);
                expect(shellExitSpy).toHaveBeenCalledWith(1);
            }
        );
    });

    // #endregion dataProjectFilePathOrExit

    // -----------------------------------------------------------------------------------------
    // #region releaseDir
    // -----------------------------------------------------------------------------------------

    describe("releaseDir", () => {
        test.each([undefined, null])(
            "when solutionDir() returns %p, it returns undefined",
            (returnValue) => {
                // Arrange
                const solutionDirSpy = jest
                    .spyOn(dotnetPath, "solutionDir")
                    .mockImplementation(() => returnValue);

                // Act
                const result = dotnetPath.releaseDir();

                // Assert
                expect(solutionDirSpy).toHaveBeenCalledTimes(1);
                expect(result).toBeUndefined();
            }
        );

        test(`when solutionDir() returns a value, it returns an absolute path to <solutionDir>/${releaseDir}`, () => {
            // Arrange
            const solutionDirSpy = jest
                .spyOn(dotnetPath, "solutionDir")
                .mockImplementation(() => mockFilePath);
            const expectedPath = upath.toUnix(
                path.join(
                    shell.pwd().toString(),
                    mockFilePath,
                    dotnetPath.RELEASE_DIRECTORY
                )
            );

            // Act
            const result = dotnetPath.releaseDir();

            // Assert
            expect(solutionDirSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(expectedPath);
        });
    });

    // #endregion releaseDir

    // -----------------------------------------------------------------------------------------
    // #region solutionDir
    // -----------------------------------------------------------------------------------------

    describe("solutionDir", () => {
        test.each([undefined, null])(
            "when solutionPath() returns %p, it returns undefined",
            (returnValue) => {
                // Arrange
                const solutionPathSpy = jest
                    .spyOn(dotnetPath, "solutionPath")
                    .mockImplementation(() => returnValue);

                // Act
                const result = dotnetPath.solutionDir();

                // Assert
                expect(solutionPathSpy).toHaveBeenCalledTimes(1);
                expect(result).toBeUndefined();
            }
        );

        test("when solutionPath() returns a value, it calls path.dirname", () => {
            // Arrange
            const solutionPathSpy = jest
                .spyOn(dotnetPath, "solutionPath")
                .mockImplementation(() => mockFilePath);

            // Act
            const result = dotnetPath.solutionDir();

            // Assert
            expect(solutionPathSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual(path.dirname(mockFilePath));
        });
    });

    // #endregion solutionDir

    // -----------------------------------------------------------------------------------------
    // #region solutionPath
    // -----------------------------------------------------------------------------------------

    describe("solutionPath", () => {
        test("when file.first returns a non-null value, it returns that value", () => {
            // Arrange
            const fileFirstSpy = jest
                .spyOn(file, "first")
                .mockImplementation(() => mockFilePath);

            // Act
            const result = dotnetPath.solutionPath();

            // Assert
            expect(fileFirstSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockFilePath);
        });

        test.each([undefined, null])(
            "when file.first returns %p, it returns undefined",
            (returnValue) => {
                // Arrange
                // If file.first only ever returns null/undefined, it means the current directory has
                // no matching files/subdirectories.
                const fileFirstSpy = jest
                    .spyOn(file, "first")
                    .mockImplementation(() => returnValue);

                // Act
                const result = dotnetPath.solutionPath();

                // Assert
                expect(fileFirstSpy).toHaveBeenCalled();
                expect(result).toBeUndefined();
            }
        );

        test("when file.first is called multiple times, it returns the first non-null value", () => {
            // Arrange
            const expectedFile = mockFilePath;
            const unexpectedFile = `unexpected-${mockFilePath}`;
            const fileFirstSpy = jest
                .spyOn(file, "first")
                .mockImplementationOnce(() => undefined)
                .mockImplementationOnce(() => null)
                .mockImplementationOnce(() => expectedFile)
                .mockImplementationOnce(() => unexpectedFile);

            // Act
            const result = dotnetPath.solutionPath();

            // Assert
            expect(fileFirstSpy).toHaveBeenCalledTimes(3);
            expect(result).toBe(expectedFile);
        });

        test("when called consecutively, it returns the cached value", () => {
            // Arrange
            const fileFirstSpy = jest
                .spyOn(file, "first")
                .mockImplementation(() => mockFilePath);

            // Act
            const result1 = dotnetPath.solutionPath();
            const result2 = dotnetPath.solutionPath();

            // Assert
            // file.first() should only be called once, and the cached variable should be returned
            // on the second call to solutionPath()
            expect(fileFirstSpy).toHaveBeenCalledTimes(1);
            expect(result1).toBe(mockFilePath);
            expect(result2).toBe(mockFilePath);
        });
    });

    // #endregion solutionPath

    // -----------------------------------------------------------------------------------------
    // #region solutionPathOrExit
    // -----------------------------------------------------------------------------------------

    describe("solutionPathOrExit", () => {
        test("when solutionPath() returns a value, it returns that value", () => {
            // Arrange
            const solutionPathSpy = jest
                .spyOn(dotnetPath, "solutionPath")
                .mockImplementation(() => mockFilePath);

            // Act
            const result = dotnetPath.solutionPathOrExit();

            // Assert
            expect(solutionPathSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockFilePath);
        });

        test.each([undefined, null])(
            "when solutionPath() returns %p, it calls shell.exit",
            (returnValue) => {
                // Arrange
                const solutionPathSpy = jest
                    .spyOn(dotnetPath, "solutionPath")
                    .mockImplementation(() => returnValue);
                const shellExitSpy = jest
                    .spyOn(shell, "exit")
                    .mockImplementation();

                // Act
                dotnetPath.solutionPathOrExit();

                // Assert
                expect(solutionPathSpy).toHaveBeenCalledTimes(1);
                expect(shellExitSpy).toHaveBeenCalledWith(1);
            }
        );
    });

    // #endregion solutionPathOrExit

    // -----------------------------------------------------------------------------------------
    // #region verify
    // -----------------------------------------------------------------------------------------

    describe("verify", () => {
        test("when shell.which() returns a value, it returns that value", () => {
            // Arrange
            const mockDotnetPath = upath.toUnix(
                path.join(faker.random.word(), "dotnet")
            );
            const shellWhichSpy = jest
                .spyOn(shell, "which")
                .mockImplementation(() => mockDotnetPath);

            // Act
            const result = dotnetPath.verify();

            // Assert
            expect(shellWhichSpy).toHaveBeenCalledWith("dotnet");
            expect(result).toBe(mockDotnetPath);
        });

        test.each([undefined, null])(
            "when shell.which() returns %p, it returns undefined",
            (returnValue) => {
                // Arrange
                const shellWhichSpy = jest
                    .spyOn(shell, "which")
                    .mockImplementation(() => returnValue);

                // Act
                const result = dotnetPath.verify();

                // Assert
                expect(shellWhichSpy).toHaveBeenCalled();
                expect(result).toBeUndefined();
            }
        );
    });

    // #endregion verify

    // -----------------------------------------------------------------------------------------
    // #region verifyOrExit
    // -----------------------------------------------------------------------------------------

    describe("verifyOrExit", () => {
        test("when shell.which returns a value, it returns that value", () => {
            // Arrange
            const mockDotnetPath = upath.toUnix(
                path.join(faker.random.word(), "dotnet")
            );
            const shellWhichSpy = jest
                .spyOn(shell, "which")
                .mockImplementation(() => mockDotnetPath);
            const shellExitSpy = jest.spyOn(shell, "exit").mockImplementation();

            // Act
            const result = dotnetPath.verifyOrExit();

            // Assert
            expect(shellWhichSpy).toHaveBeenCalledWith("dotnet");
            expect(shellExitSpy).not.toHaveBeenCalled();
            expect(result).toBe(mockDotnetPath);
        });

        test.each([undefined, null])(
            "when shell.which() returns %p, it calls shell.exit",
            (returnValue) => {
                // Arrange
                const shellWhichSpy = jest
                    .spyOn(shell, "which")
                    .mockImplementation(() => returnValue);
                const shellExitSpy = jest
                    .spyOn(shell, "exit")
                    .mockImplementation();

                // Act
                dotnetPath.verifyOrExit();

                // Assert
                expect(shellWhichSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalledWith(1);
            }
        );
    });

    // #endregion verifyOrExit

    // -----------------------------------------------------------------------------------------
    // #region webProjectFileDir
    // -----------------------------------------------------------------------------------------

    describe("webProjectFileDir", () => {
        test.each([undefined, null])(
            "when webProjectFilePath() returns %p, it returns undefined",
            (returnValue) => {
                // Arrange
                const webProjectFilePathSpy = jest
                    .spyOn(dotnetPath, "webProjectFilePath")
                    .mockImplementation(() => returnValue);

                // Act
                const result = dotnetPath.webProjectFileDir();

                // Assert
                expect(webProjectFilePathSpy).toHaveBeenCalledTimes(1);
                expect(result).toBeUndefined();
            }
        );

        test("when webProjectFilePath() returns a value, it calls path.dirname", () => {
            // Arrange
            const webProjectFilePathSpy = jest
                .spyOn(dotnetPath, "webProjectFilePath")
                .mockImplementation(() => mockFilePath);

            // Act
            const result = dotnetPath.webProjectFileDir();

            // Assert
            expect(webProjectFilePathSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual(path.dirname(mockFilePath));
        });
    });

    // #endregion webProjectFileDir

    // -----------------------------------------------------------------------------------------
    // #region webProjectFilePath
    // -----------------------------------------------------------------------------------------

    describe("webProjectFilePath", () => {
        test("when file.first returns a non-null value, it returns that value", () => {
            // Arrange
            const fileFirstSpy = jest
                .spyOn(file, "first")
                .mockImplementation(() => mockFilePath);

            // Act
            const result = dotnetPath.webProjectFilePath();

            // Assert
            expect(fileFirstSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockFilePath);
        });

        test.each([undefined, null])(
            "when file.first returns %p, it returns undefined",
            (returnValue) => {
                // Arrange
                // If file.first only ever returns null/undefined, it means the current directory has
                // no matching files/subdirectories.
                const fileFirstSpy = jest
                    .spyOn(file, "first")
                    .mockImplementation(() => returnValue);

                // Act
                const result = dotnetPath.webProjectFilePath();

                // Assert
                expect(fileFirstSpy).toHaveBeenCalled();
                expect(result).toBeUndefined();
            }
        );

        test("when file.first is called multiple times, it returns the first non-null value", () => {
            // Arrange
            const expectedFile = mockFilePath;
            const unexpectedFile = `unexpected-${mockFilePath}`;
            const fileFirstSpy = jest
                .spyOn(file, "first")
                .mockImplementationOnce(() => undefined)
                .mockImplementationOnce(() => null)
                .mockImplementationOnce(() => expectedFile)
                .mockImplementationOnce(() => unexpectedFile);

            // Act
            const result = dotnetPath.webProjectFilePath();

            // Assert
            expect(fileFirstSpy).toHaveBeenCalledTimes(3);
            expect(result).toBe(expectedFile);
        });

        test("when called consecutively, it returns the cached value", () => {
            // Arrange
            const fileFirstSpy = jest
                .spyOn(file, "first")
                .mockImplementation(() => mockFilePath);

            // Act
            const result1 = dotnetPath.webProjectFilePath();
            const result2 = dotnetPath.webProjectFilePath();

            // Assert
            // file.first() should only be called once, and the cached variable should be returned
            // on the second call to webProjectFilePath()
            expect(fileFirstSpy).toHaveBeenCalledTimes(1);
            expect(result1).toBe(mockFilePath);
            expect(result2).toBe(mockFilePath);
        });
    });

    // #endregion webProjectFilePath

    // -----------------------------------------------------------------------------------------
    // #region webProjectFilePathOrExit
    // -----------------------------------------------------------------------------------------

    describe("webProjectFilePathOrExit", () => {
        test("when webProjectFilePath() returns a value, it returns that value", () => {
            // Arrange
            const webProjectFilePathSpy = jest
                .spyOn(dotnetPath, "webProjectFilePath")
                .mockImplementation(() => mockFilePath);

            // Act
            const result = dotnetPath.webProjectFilePathOrExit();

            // Assert
            expect(webProjectFilePathSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockFilePath);
        });

        test.each([undefined, null])(
            "when webProjectFilePath() returns %p, it calls shell.exit",
            (returnValue) => {
                // Arrange
                const webProjectFilePathSpy = jest
                    .spyOn(dotnetPath, "webProjectFilePath")
                    .mockImplementation(() => returnValue);
                const shellExitSpy = jest
                    .spyOn(shell, "exit")
                    .mockImplementation();

                // Act
                dotnetPath.webProjectFilePathOrExit();

                // Assert
                expect(webProjectFilePathSpy).toHaveBeenCalledTimes(1);
                expect(shellExitSpy).toHaveBeenCalledWith(1);
            }
        );
    });

    // #endregion webProjectFilePathOrExit
});

// #endregion Tests
