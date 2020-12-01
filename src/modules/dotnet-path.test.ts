import faker from "faker";
import { DotnetPath as DotnetPathModule } from "./dotnet-path";
import upath from "upath";
import { File } from "./file";
import { TestUtils } from "../tests/test-utils";
import shell from "shelljs";

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("DotnetPath", () => {
    let DotnetPath: typeof DotnetPathModule;
    let mockFilePath: string;
    let releaseDir: string;
    let cliFilePath: string;

    beforeEach(() => {
        mockFilePath = TestUtils.randomFilename();

        // Due to the way the DotnetPath module caches values, we need to isolate the module in each
        // test to prevent side effects and test behavior properly.
        // See https://stackoverflow.com/questions/48989643/how-to-reset-module-imported-between-tests
        jest.isolateModules(() => {
            const {
                DotnetPath: uncachedDotnetPathModule,
            }: {
                DotnetPath: typeof DotnetPathModule;
            } = require("./dotnet-path");

            DotnetPath = uncachedDotnetPathModule;

            cliFilePath = DotnetPath.CLI_FILE_PATH;
            releaseDir = DotnetPath.RELEASE_DIRECTORY;
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
                    .spyOn(DotnetPath, "cliPath")
                    .mockImplementation(() => returnValue as any);

                // Act
                const result = DotnetPath.cliDir();

                // Assert
                expect(cliPathSpy).toHaveBeenCalledTimes(1);
                expect(result).toBeUndefined();
            }
        );

        test("when cliPath() returns a value, it calls path.dirname", () => {
            // Arrange
            const cliPathSpy = jest
                .spyOn(DotnetPath, "cliPath")
                .mockImplementation(() => mockFilePath);

            // Act
            const result = DotnetPath.cliDir();

            // Assert
            expect(cliPathSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual(upath.dirname(mockFilePath));
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
                    .spyOn(DotnetPath, "solutionDir")
                    .mockImplementation(() => returnValue as any);

                // Act
                const result = DotnetPath.cliPath();

                // Assert
                expect(solutionDirSpy).toHaveBeenCalledTimes(1);
                expect(result).toBeUndefined();
            }
        );

        test(`when solutionDir has a value, it calls File.first with <solutionDir>/${cliFilePath}`, () => {
            // Arrange
            jest.spyOn(DotnetPath, "solutionDir").mockImplementation(
                () => mockFilePath
            );
            const FileFirstSpy = jest.spyOn(File, "first").mockImplementation();
            const expectedPath = upath.join(
                mockFilePath,
                DotnetPath.CLI_FILE_PATH
            );

            // Act
            DotnetPath.cliPath();

            // Assert
            expect(FileFirstSpy).toHaveBeenCalledWith(expectedPath);
        });

        test("when called consecutively, it returns the cached value", () => {
            // Arrange
            jest.spyOn(DotnetPath, "solutionDir").mockImplementation(
                () => mockFilePath
            );
            const FileFirstSpy = jest
                .spyOn(File, "first")
                .mockImplementation(() => mockFilePath);

            // Act
            const result1 = DotnetPath.cliPath();
            const result2 = DotnetPath.cliPath();

            // Assert
            // File.first() should only be called once, and the cached variable should be returned
            // on the second call to cliPath()
            expect(FileFirstSpy).toHaveBeenCalledTimes(1);
            expect(result1).toBe(mockFilePath);
            expect(result2).toBe(mockFilePath);
        });
    });

    // #endregion cliPath

    // -----------------------------------------------------------------------------------------
    // #region dataProjectFilePath
    // -----------------------------------------------------------------------------------------

    describe("dataProjectFilePath", () => {
        test("when File.first returns a non-null value, it returns that value", () => {
            // Arrange
            const FileFirstSpy = jest
                .spyOn(File, "first")
                .mockImplementation(() => mockFilePath);

            // Act
            const result = DotnetPath.dataProjectFilePath();

            // Assert
            expect(FileFirstSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockFilePath);
        });

        test.each([undefined, null])(
            "when File.first returns %p, it returns undefined",
            (returnValue) => {
                // Arrange
                // If File.first only ever returns null/undefined, it means the current directory has
                // no matching Files/subdirectories.
                const FileFirstSpy = jest
                    .spyOn(File, "first")
                    .mockImplementation(() => returnValue as any);

                // Act
                const result = DotnetPath.dataProjectFilePath();

                // Assert
                expect(FileFirstSpy).toHaveBeenCalled();
                expect(result).toBeUndefined();
            }
        );

        test("when File.first is called multiple times, it returns the first non-null value", () => {
            // Arrange
            const expectedFile = mockFilePath;
            const unexpectedFile = `unexpected-${mockFilePath}`;
            const FileFirstSpy = jest
                .spyOn(File, "first")
                .mockImplementationOnce(() => undefined as any)
                .mockImplementationOnce(() => null as any)
                .mockImplementationOnce(() => expectedFile)
                .mockImplementationOnce(() => unexpectedFile);

            // Act
            const result = DotnetPath.dataProjectFilePath();

            // Assert
            expect(FileFirstSpy).toHaveBeenCalledTimes(3);
            expect(result).toBe(expectedFile);
        });

        test("when called consecutively, it returns the cached value", () => {
            // Arrange
            const FileFirstSpy = jest
                .spyOn(File, "first")
                .mockImplementation(() => mockFilePath);

            // Act
            const result1 = DotnetPath.dataProjectFilePath();
            const result2 = DotnetPath.dataProjectFilePath();

            // Assert
            // File.first() should only be called once, and the cached variable should be returned
            // on the second call to dataProjectFilePath()
            expect(FileFirstSpy).toHaveBeenCalledTimes(1);
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
                .spyOn(DotnetPath, "dataProjectFilePath")
                .mockImplementation(() => mockFilePath);

            // Act
            const result = DotnetPath.dataProjectFilePathOrExit();

            // Assert
            expect(dataProjectFilePathSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockFilePath);
        });

        test.each([undefined, null])(
            "when dataProjectFilePath() returns %p, it calls shell.exit",
            (returnValue) => {
                // Arrange
                const dataProjectFilePathSpy = jest
                    .spyOn(DotnetPath, "dataProjectFilePath")
                    .mockImplementation(() => returnValue as any);
                const shellExitSpy = TestUtils.spyOnShellExit();

                // Act
                DotnetPath.dataProjectFilePathOrExit();

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
                    .spyOn(DotnetPath, "solutionDir")
                    .mockImplementation(() => returnValue as any);

                // Act
                const result = DotnetPath.releaseDir();

                // Assert
                expect(solutionDirSpy).toHaveBeenCalledTimes(1);
                expect(result).toBeUndefined();
            }
        );

        test(`when solutionDir() returns a value, it returns an absolute path to <solutionDir>/${releaseDir}`, () => {
            // Arrange
            const solutionDirSpy = jest
                .spyOn(DotnetPath, "solutionDir")
                .mockImplementation(() => mockFilePath);
            const expectedPath = upath.join(
                shell.pwd().toString(),
                mockFilePath,
                DotnetPath.RELEASE_DIRECTORY
            );

            // Act
            const result = DotnetPath.releaseDir();

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
                    .spyOn(DotnetPath, "solutionPath")
                    .mockImplementation(() => returnValue as any);

                // Act
                const result = DotnetPath.solutionDir();

                // Assert
                expect(solutionPathSpy).toHaveBeenCalledTimes(1);
                expect(result).toBeUndefined();
            }
        );

        test("when solutionPath() returns a value, it calls path.dirname", () => {
            // Arrange
            const solutionPathSpy = jest
                .spyOn(DotnetPath, "solutionPath")
                .mockImplementation(() => mockFilePath);

            // Act
            const result = DotnetPath.solutionDir();

            // Assert
            expect(solutionPathSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual(upath.dirname(mockFilePath));
        });
    });

    // #endregion solutionDir

    // -----------------------------------------------------------------------------------------
    // #region solutionPath
    // -----------------------------------------------------------------------------------------

    describe("solutionPath", () => {
        test("when File.first returns a non-null value, it returns that value", () => {
            // Arrange
            const FileFirstSpy = jest
                .spyOn(File, "first")
                .mockImplementation(() => mockFilePath);

            // Act
            const result = DotnetPath.solutionPath();

            // Assert
            expect(FileFirstSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockFilePath);
        });

        test.each([undefined, null])(
            "when File.first returns %p, it returns undefined",
            (returnValue) => {
                // Arrange
                // If File.first only ever returns null/undefined, it means the current directory has
                // no matching Files/subdirectories.
                const FileFirstSpy = jest
                    .spyOn(File, "first")
                    .mockImplementation(() => returnValue as any);

                // Act
                const result = DotnetPath.solutionPath();

                // Assert
                expect(FileFirstSpy).toHaveBeenCalled();
                expect(result).toBeUndefined();
            }
        );

        test("when File.first is called multiple times, it returns the first non-null value", () => {
            // Arrange
            const expectedFile = mockFilePath;
            const unexpectedFile = `unexpected-${mockFilePath}`;
            const FileFirstSpy = jest
                .spyOn(File, "first")
                .mockImplementationOnce(() => undefined as any)
                .mockImplementationOnce(() => null as any)
                .mockImplementationOnce(() => expectedFile)
                .mockImplementationOnce(() => unexpectedFile);

            // Act
            const result = DotnetPath.solutionPath();

            // Assert
            expect(FileFirstSpy).toHaveBeenCalledTimes(3);
            expect(result).toBe(expectedFile);
        });

        test("when called consecutively, it returns the cached value", () => {
            // Arrange
            const FileFirstSpy = jest
                .spyOn(File, "first")
                .mockImplementation(() => mockFilePath);

            // Act
            const result1 = DotnetPath.solutionPath();
            const result2 = DotnetPath.solutionPath();

            // Assert
            // File.first() should only be called once, and the cached variable should be returned
            // on the second call to solutionPath()
            expect(FileFirstSpy).toHaveBeenCalledTimes(1);
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
                .spyOn(DotnetPath, "solutionPath")
                .mockImplementation(() => mockFilePath);

            // Act
            const result = DotnetPath.solutionPathOrExit();

            // Assert
            expect(solutionPathSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockFilePath);
        });

        test.each([undefined, null])(
            "when solutionPath() returns %p, it calls shell.exit",
            (returnValue) => {
                // Arrange
                const solutionPathSpy = jest
                    .spyOn(DotnetPath, "solutionPath")
                    .mockImplementation(() => returnValue as any);
                const shellExitSpy = TestUtils.spyOnShellExit();

                // Act
                DotnetPath.solutionPathOrExit();

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
            const mockDotnetPath = upath.join(faker.random.word(), "dotnet");
            const shellWhichSpy = jest
                .spyOn(shell, "which")
                .mockImplementation(() => mockDotnetPath as any);

            // Act
            const result = DotnetPath.verify();

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
                    .mockImplementation(() => returnValue as any);

                // Act
                const result = DotnetPath.verify();

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
            const mockDotnetPath = upath.join(faker.random.word(), "dotnet");
            const shellWhichSpy = jest
                .spyOn(shell, "which")
                .mockImplementation(() => mockDotnetPath as any);
            const shellExitSpy = TestUtils.spyOnShellExit();

            // Act
            const result = DotnetPath.verifyOrExit();

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
                    .mockImplementation(() => returnValue as any);
                const shellExitSpy = TestUtils.spyOnShellExit();

                // Act
                DotnetPath.verifyOrExit();

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
                    .spyOn(DotnetPath, "webProjectFilePath")
                    .mockImplementation(() => returnValue as any);

                // Act
                const result = DotnetPath.webProjectFileDir();

                // Assert
                expect(webProjectFilePathSpy).toHaveBeenCalledTimes(1);
                expect(result).toBeUndefined();
            }
        );

        test("when webProjectFilePath() returns a value, it calls path.dirname", () => {
            // Arrange
            const webProjectFilePathSpy = jest
                .spyOn(DotnetPath, "webProjectFilePath")
                .mockImplementation(() => mockFilePath);

            // Act
            const result = DotnetPath.webProjectFileDir();

            // Assert
            expect(webProjectFilePathSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual(upath.dirname(mockFilePath));
        });
    });

    // #endregion webProjectFileDir

    // -----------------------------------------------------------------------------------------
    // #region webProjectFilePath
    // -----------------------------------------------------------------------------------------

    describe("webProjectFilePath", () => {
        test("when File.first returns a non-null value, it returns that value", () => {
            // Arrange
            const FileFirstSpy = jest
                .spyOn(File, "first")
                .mockImplementation(() => mockFilePath);

            // Act
            const result = DotnetPath.webProjectFilePath();

            // Assert
            expect(FileFirstSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockFilePath);
        });

        test.each([undefined, null])(
            "when File.first returns %p, it returns undefined",
            (returnValue) => {
                // Arrange
                // If File.first only ever returns null/undefined, it means the current directory has
                // no matching Files/subdirectories.
                const FileFirstSpy = jest
                    .spyOn(File, "first")
                    .mockImplementation(() => returnValue as any);

                // Act
                const result = DotnetPath.webProjectFilePath();

                // Assert
                expect(FileFirstSpy).toHaveBeenCalled();
                expect(result).toBeUndefined();
            }
        );

        test("when File.first is called multiple times, it returns the first non-null value", () => {
            // Arrange
            const expectedFile = mockFilePath;
            const unexpectedFile = `unexpected-${mockFilePath}`;
            const FileFirstSpy = jest
                .spyOn(File, "first")
                .mockImplementationOnce(() => undefined as any)
                .mockImplementationOnce(() => null as any)
                .mockImplementationOnce(() => expectedFile)
                .mockImplementationOnce(() => unexpectedFile);

            // Act
            const result = DotnetPath.webProjectFilePath();

            // Assert
            expect(FileFirstSpy).toHaveBeenCalledTimes(3);
            expect(result).toBe(expectedFile);
        });

        test("when called consecutively, it returns the cached value", () => {
            // Arrange
            const FileFirstSpy = jest
                .spyOn(File, "first")
                .mockImplementation(() => mockFilePath);

            // Act
            const result1 = DotnetPath.webProjectFilePath();
            const result2 = DotnetPath.webProjectFilePath();

            // Assert
            // File.first() should only be called once, and the cached variable should be returned
            // on the second call to webProjectFilePath()
            expect(FileFirstSpy).toHaveBeenCalledTimes(1);
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
                .spyOn(DotnetPath, "webProjectFilePath")
                .mockImplementation(() => mockFilePath);

            // Act
            const result = DotnetPath.webProjectFilePathOrExit();

            // Assert
            expect(webProjectFilePathSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockFilePath);
        });

        test.each([undefined, null])(
            "when webProjectFilePath() returns %p, it calls shell.exit",
            (returnValue) => {
                // Arrange
                const webProjectFilePathSpy = jest
                    .spyOn(DotnetPath, "webProjectFilePath")
                    .mockImplementation(() => returnValue as any);
                const shellExitSpy = TestUtils.spyOnShellExit();

                // Act
                DotnetPath.webProjectFilePathOrExit();

                // Assert
                expect(webProjectFilePathSpy).toHaveBeenCalledTimes(1);
                expect(shellExitSpy).toHaveBeenCalledWith(1);
            }
        );
    });

    // #endregion webProjectFilePathOrExit
});

// #endregion Tests
