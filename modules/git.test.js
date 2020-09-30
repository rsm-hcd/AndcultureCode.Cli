// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const faker = require("faker");
const git = require("./git");
const nock = require("nock");
const shell = require("shelljs");
const testUtils = require("../tests/test-utils");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("git", () => {
    // -----------------------------------------------------------------------------------------
    // #region clone
    // -----------------------------------------------------------------------------------------

    describe("clone", () => {
        test.each`
            name
            ${""}
            ${" "}
            ${null}
            ${undefined}
        `("when name is '$name', returns false", ({ name }) => {
            // Arrange & Act
            const result = git.clone(name, faker.internet.url());

            // Assert
            expect(result).toBeFalse();
        });

        test.each`
            url
            ${""}
            ${" "}
            ${null}
            ${undefined}
        `("when url is '$url', returns false", ({ url }) => {
            // Arrange & Act
            const result = git.clone(faker.internet.url(), url);

            // Assert
            expect(result).toBeFalse();
        });

        test("when repository clone fails, returns false", () => {
            // Arrange
            jest.spyOn(shell, "exec").mockImplementation(
                testUtils.mockShellFunction(1)
            );

            // Act & Assert
            expect(
                git.clone(faker.random.word(), faker.internet.url())
            ).toBeFalse();
        });

        test("when repository clone succeeds, returns true", () => {
            // Arrange
            jest.spyOn(shell, "exec").mockImplementation(
                testUtils.mockShellFunction(0)
            );

            // Act & Assert
            expect(
                git.clone(faker.random.word(), faker.internet.url())
            ).toBeTrue();
        });
    });

    // #endregion clone
});

// #endregion Tests
