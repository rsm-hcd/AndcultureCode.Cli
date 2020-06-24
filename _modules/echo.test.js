// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const echo  = require("./echo");
const faker = require("faker");
const shell = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Mocks
// -----------------------------------------------------------------------------------------

jest.mock("./dir");
jest.mock("path");

// #endregion Mocks

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("echo", () => {

    // -----------------------------------------------------------------------------------------
    // #region success
    // -----------------------------------------------------------------------------------------

    describe("success", () => {

        beforeEach(() => {
            jest.spyOn(shell, "exit").mockImplementation(() => { });
        });

        test("given echo.success, returns string containing message", () => {
            // Arrange
            const expected = faker.random.words();

            // Act
            const result = echo.success(expected);

            // Assert
            expect(result).toContain(expected);
        });

    });

    // #endregion success
});

// #endregion Tests
