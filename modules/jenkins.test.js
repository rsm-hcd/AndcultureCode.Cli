// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const jenkins = require("./jenkins");
const fs = require("fs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("jenkins", () => {
    describe("configureCredentials", () => {
        it("when url is empty then returns false", () => {
            // Arrange
            const url = "";
            const username = "aaa";
            const token = "aaa";
            // Act
            const result = jenkins.configureCredentials(url, username, token);
            // Assert
            expect(result).toBe(false);
        });

        it("when username is empty then returns false", () => {
            // Arrange
            const url = "aaa";
            const username = "";
            const token = "aaa";
            // Act
            const result = jenkins.configureCredentials(url, username, token);
            // Assert
            expect(result).toBe(false);
        });

        it("when token is empty then returns with errors", () => {
            // Arrange
            const url = "aaa";
            const username = "aaa";
            const token = "";
            // Act
            const result = jenkins.configureCredentials(url, username, token);
            // Assert
            expect(result).toBe(false);
        });

        it("when url, username and token provided then returns true ", () => {
            // Arrange
            jenkins.writeToConfig = jest.fn(() => true);
            const url = "aaa";
            const username = "aaa";
            const token = "aaa";
            // Act
            const result = jenkins.configureCredentials(url, username, token);
            // Assert
            expect(result).toBe(true);
        });
    });

    describe("getConfig", () => {
        it("when config does not exist, then returns undefined", () => {
            // Arrange
            jest.mock("fs");
            fs.readFileSync = jest.fn(() => undefined);

            // Act
            const result = jenkins.getConfig();

            // Assert
            expect(result).toBeUndefined();
        });

        it("should return a JSON config object", () => {
            // Arrange
            jest.mock("fs");
            fs.readFileSync = jest.fn(() => JSON.stringify({ value: true }));

            // Act
            const result = jenkins.getConfig();

            // Assert
            expect(result).toBeObject();
        });
    });

    describe("getConfigPath", () => {
        it("should return a string ending in .jenkinsconfig", () => {
            // Act
            const result = jenkins.getConfigPath();
            // Assert
            expect(result).toContain(".jenkinsconfig");
        });
    });

    describe("writeToConfig", () => {
        it("should return true", () => {
            // Arrange
            jest.mock("fs");
            fs.writeFileSync = jest.fn(() => undefined);
            // Act
            const result = jenkins.writeToConfig({ test: "test" });

            // Assert
            expect(result).toBe(true);
        });
    });
});

// #endregion Tests
