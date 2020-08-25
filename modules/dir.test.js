// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const dir = require("./dir");
const faker = require("faker");
const fs = require("fs");
const shell = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("dir", () => {
    let mockDir;
    beforeEach(() => {
        mockDir = faker.random.word();
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
            dir.deleteIfExists(mockDir);

            // Assert
            expect(shellRmSpy).not.toHaveBeenCalled();
        });

        test("when directory exists, it calls shell.rm", () => {
            // Arrange
            jest.spyOn(fs, "existsSync").mockImplementation(() => true);
            const shellRmSpy = jest.spyOn(shell, "rm").mockImplementation();

            // Act
            dir.deleteIfExists(mockDir);

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
            dir.popd(mockDir);

            // Assert
            expect(shellPopdSpy).toHaveBeenCalledWith("-q", mockDir);
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
            dir.pushd(mockDir);

            // Assert
            expect(shellPushdSpy).toHaveBeenCalledWith("-q", mockDir);
        });
    });

    // #endregion pushd
});

// #endregion Tests
