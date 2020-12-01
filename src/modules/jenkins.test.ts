import { Jenkins } from "./jenkins";
import fs from "fs";
import { Echo } from "./echo";

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("Jenkins", () => {
    // -----------------------------------------------------------------------------------------
    // #region configureCredentials
    // -----------------------------------------------------------------------------------------

    describe("configureCredentials", () => {
        test("when url is empty then returns false", () => {
            // Arrange
            const url = "";
            const username = "aaa";
            const token = "aaa";
            const echoSpy = jest.spyOn(Echo, "errors").mockImplementation();

            // Act
            const result = Jenkins.configureCredentials(url, username, token);

            // Assert
            expect(result).toBeFalse();
            expect(echoSpy).toHaveBeenCalledTimes(1);
        });

        test("when username is empty then returns false", () => {
            // Arrange
            const url = "aaa";
            const username = "";
            const token = "aaa";
            const echoSpy = jest.spyOn(Echo, "errors").mockImplementation();

            // Act
            const result = Jenkins.configureCredentials(url, username, token);

            // Assert
            expect(result).toBeFalse();
            expect(echoSpy).toHaveBeenCalledTimes(1);
        });

        test("when token is empty then returns with errors", () => {
            // Arrange
            const url = "aaa";
            const username = "aaa";
            const token = "";
            const echoSpy = jest.spyOn(Echo, "errors").mockImplementation();

            // Act
            const result = Jenkins.configureCredentials(url, username, token);

            // Assert
            expect(result).toBeFalse();
            expect(echoSpy).toHaveBeenCalledTimes(1);
        });

        test("when url, username and token provided then returns true ", () => {
            // Arrange
            jest.spyOn(Jenkins, "writeToConfig").mockReturnValue(true);
            const url = "aaa";
            const username = "aaa";
            const token = "aaa";

            // Act
            const result = Jenkins.configureCredentials(url, username, token);

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
            jest.spyOn(fs, "readFileSync").mockReturnValue(undefined as any);

            // Act
            const result = Jenkins.getConfig();

            // Assert
            expect(result).toBeUndefined();
        });

        test("should return a JSON config object", () => {
            // Arrange
            jest.spyOn(fs, "readFileSync").mockReturnValue(
                JSON.stringify({ value: true })
            );

            // Act
            const result = Jenkins.getConfig();

            // Assert
            expect(result).toBeObject();
        });
    });

    // #endregion getConfig

    // -----------------------------------------------------------------------------------------
    // #region getConfigPath
    // -----------------------------------------------------------------------------------------

    describe("getConfigPath", () => {
        test(`should return a string ending in ${Jenkins.CONFIG_FILE}`, () => {
            // Act
            const result = Jenkins.getConfigPath();

            // Assert
            expect(result).toContain(Jenkins.CONFIG_FILE);
        });
    });

    // #endregion getConfigPath

    // -----------------------------------------------------------------------------------------
    // #region writeToConfig
    // -----------------------------------------------------------------------------------------

    describe("writeToConfig", () => {
        test("when writeFileSyncSucceeds then returns true", () => {
            // Arrange
            jest.spyOn(fs, "writeFileSync").mockImplementation();

            // Act
            const result = Jenkins.writeToConfig({ test: "test" });

            // Assert
            expect(result).toBeTrue();
        });
    });

    // #endregion writeToConfig
});

// #endregion Tests
