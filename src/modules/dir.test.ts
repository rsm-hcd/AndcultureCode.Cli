import { Dir } from "./dir";
import fs from "fs";
import shell from "shelljs";
import { TestUtils } from "../tests/test-utils";

// -----------------------------------------------------------------------------------------
// #region Mocks
// -----------------------------------------------------------------------------------------

jest.unmock("./dir");

// #endregion Mocks

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("dir", () => {
    let mockDir: string;
    beforeEach(() => {
        mockDir = TestUtils.randomWord();
    });

    // -----------------------------------------------------------------------------------------
    // #region deleteIfExists
    // -----------------------------------------------------------------------------------------

    describe("deleteIfExists", () => {
        test("when directory does not exist, it does not call shell.rm", () => {
            // Arrange
            jest.spyOn(fs, "existsSync").mockImplementation(() => false);
            const shellRmSpy = jest.spyOn(shell, "rm").mockImplementation();

            // Act
            Dir.deleteIfExists(mockDir);

            // Assert
            expect(shellRmSpy).not.toHaveBeenCalled();
        });

        test("when directory exists, it calls shell.rm", () => {
            // Arrange
            jest.spyOn(fs, "existsSync").mockImplementation(() => true);
            const shellRmSpy = jest.spyOn(shell, "rm").mockImplementation();

            // Act
            Dir.deleteIfExists(mockDir);

            // Assert
            expect(shellRmSpy).toHaveBeenCalled();
        });
    });

    // #endregion deleteIfExists

    // -----------------------------------------------------------------------------------------
    // #region popd
    // -----------------------------------------------------------------------------------------

    describe("popd", () => {
        test("it calls shell.popd with '-q' flag", () => {
            // Arrange
            const shellPopdSpy = jest.spyOn(shell, "popd").mockImplementation();

            // Act
            Dir.popd();

            // Assert
            expect(shellPopdSpy).toHaveBeenCalledWith("-q");
        });
    });

    // #endregion popd

    // -----------------------------------------------------------------------------------------
    // #region pushd
    // -----------------------------------------------------------------------------------------

    describe("pushd", () => {
        test("it calls shell.pushd with '-q' flag", () => {
            // Arrange
            const shellPushdSpy = jest
                .spyOn(shell, "pushd")
                .mockImplementation();

            // Act
            Dir.pushd(mockDir);

            // Assert
            expect(shellPushdSpy).toHaveBeenCalledWith("-q", mockDir);
        });
    });

    // #endregion pushd
});

// #endregion Tests
