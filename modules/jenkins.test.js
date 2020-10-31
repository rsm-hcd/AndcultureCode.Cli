// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const jenkins = require("./jenkins");
const fs = require("fs");
const echo = require("./echo");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("jenkins", () => {
    // -----------------------------------------------------------------------------------------
    // #region configureCredentials
    // -----------------------------------------------------------------------------------------

    describe("configureCredentials", () => {
        test("when url is empty then returns false", () => {
            // Arrange
            const url = "";
            const username = "aaa";
            const token = "aaa";
            const echoSpy = jest.spyOn(echo, "errors").mockResolvedValueOnce();

            // Act
            const result = jenkins.configureCredentials(url, username, token);

            // Assert
            expect(result).toBeFalse();
            expect(echoSpy).toHaveBeenCalledTimes(1);
        });

        test("when username is empty then returns false", () => {
            // Arrange
            const url = "aaa";
            const username = "";
            const token = "aaa";
            const echoSpy = jest.spyOn(echo, "errors").mockResolvedValueOnce();

            // Act
            const result = jenkins.configureCredentials(url, username, token);

            // Assert
            expect(result).toBeFalse();
            expect(echoSpy).toHaveBeenCalledTimes(1);
        });

        test("when token is empty then returns with errors", () => {
            // Arrange
            const url = "aaa";
            const username = "aaa";
            const token = "";
            const echoSpy = jest.spyOn(echo, "errors").mockResolvedValueOnce();

            // Act
            const result = jenkins.configureCredentials(url, username, token);

            // Assert
            expect(result).toBeFalse();
            expect(echoSpy).toHaveBeenCalledTimes(1);
        });

        test("when url, username and token provided then returns true ", () => {
            // Arrange
            jenkins.writeToConfig = jest.fn(() => true);
            const url = "aaa";
            const username = "aaa";
            const token = "aaa";

            // Act
            const result = jenkins.configureCredentials(url, username, token);

            // Assert
            expect(result).toBeTrue();
        });
    });

    // #endregion configureCredentials

    // -----------------------------------------------------------------------------------------
    // #region getConfig
    // -----------------------------------------------------------------------------------------

    describe("getConfig", () => {
        test("when config does not exist, then returns undefined", () => {
            // Arrange
            jest.spyOn(fs, "readFileSync").mockImplementation(
                jest.fn(() => undefined)
            );

            // Act
            const result = jenkins.getConfig();

            // Assert
            expect(result).toBeUndefined();
        });

        test("should return a JSON config object", () => {
            // Arrange
            jest.spyOn(fs, "readFileSync").mockImplementation(
                jest.fn(() => JSON.stringify({ value: true }))
            );

            // Act
            const result = jenkins.getConfig();

            // Assert
            expect(result).toBeObject();
        });
    });
    // #endregion getConfig

    // -----------------------------------------------------------------------------------------
    // #region getConfigPath
    // -----------------------------------------------------------------------------------------

    describe("getConfigPath", () => {
        test("should return a string ending in .jenkinsconfig", () => {
            // Act
            const result = jenkins.getConfigPath();

            // Assert
            expect(result).toContain(".jenkinsconfig");
        });
    });
    // #endregion getConfigPath

    // -----------------------------------------------------------------------------------------
    // #region writeToConfig
    // -----------------------------------------------------------------------------------------

    describe("writeToConfig", () => {
        test("when writeFileSyncSucceeds then returns true", () => {
            // Arrange
            jest.spyOn(fs, "writeFileSync").mockImplementation(
                jest.fn(() => undefined)
            );

            // Act
            const result = jenkins.writeToConfig({ test: "test" });

            // Assert
            expect(result).toBeTrue();
        });
    });
    // #endregion writeToConfig
});

// #endregion Tests
