import faker from "faker";
import { Git } from "./git";
import nock from "nock";
import shell from "shelljs";
import { TestUtils } from "../tests/test-utils";

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
            const result = Git.clone(name, faker.internet.url());

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
            const result = Git.clone(faker.internet.url(), url);

            // Assert
            expect(result).toBeFalse();
        });

        test("when repository clone fails, returns false", () => {
            // Arrange
            jest.spyOn(shell, "exec").mockImplementation(
                TestUtils.mockShellFunction(1)
            );

            // Act & Assert
            expect(
                Git.clone(faker.random.word(), faker.internet.url())
            ).toBeFalse();
        });

        test("when repository clone succeeds, returns true", () => {
            // Arrange
            jest.spyOn(shell, "exec").mockImplementation(
                TestUtils.mockShellFunction(0)
            );

            // Act & Assert
            expect(
                Git.clone(faker.random.word(), faker.internet.url())
            ).toBeTrue();
        });
    });

    // #endregion clone
});

// #endregion Tests
