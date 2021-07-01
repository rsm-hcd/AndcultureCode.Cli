import faker from "faker";
import { Git } from "./git";
import shell from "shelljs";
import { TestUtils } from "../tests/test-utils";

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("git", () => {
    // -----------------------------------------------------------------------------------------
    // #region add
    // -----------------------------------------------------------------------------------------

    describe("add", () => {
        test("when single path, calls shell.exec", () => {
            // Arrange
            const shellExecSpy = jest.spyOn(shell, "exec");
            const path = TestUtils.randomFilename();
            const expected = `git add ${path}`;

            // Act
            Git.add(path);

            // Assert
            expect(shellExecSpy).toHaveBeenCalledWith(expected);
        });

        test("when multiple paths, calls shell.exec with space separated paths", () => {
            // Arrange
            const shellExecSpy = jest.spyOn(shell, "exec");
            const paths = TestUtils.randomWords();
            const expected = `git add ${paths.join(" ")}`;

            // Act
            Git.add(...paths);

            // Assert
            expect(shellExecSpy).toHaveBeenCalledWith(expected);
        });
    });

    // #endregion add

    // -----------------------------------------------------------------------------------------
    // #region addAll
    // -----------------------------------------------------------------------------------------

    describe("addAll", () => {
        test("calls git add -A", () => {
            // Arrange
            const shellExecSpy = jest.spyOn(shell, "exec");

            // Act
            Git.addAll();

            // Assert
            expect(shellExecSpy).toHaveBeenCalledWith("git add -A");
        });
    });

    // #endregion addAll

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

    // -----------------------------------------------------------------------------------------
    // #region commit
    // -----------------------------------------------------------------------------------------

    describe("commit", () => {
        test.each([undefined, null, "", " "])(
            "when message %p, returns false",
            (message) => {
                // Arrange & Act
                const result = Git.commit(message as string);

                // Assert
                expect(result).toBeFalse();
            }
        );

        test("calls git commit -m with quote escaped message", () => {
            // Arrange
            const message = TestUtils.randomWord();
            const shellExecSpy = jest.spyOn(shell, "exec");

            // Act
            Git.commit(message);

            // Assert
            expect(shellExecSpy).toHaveBeenCalledWith(
                `git commit -m "${message}"`
            );
        });
    });

    // #endregion commit

    // -----------------------------------------------------------------------------------------
    // #region commitRev
    // -----------------------------------------------------------------------------------------

    describe("commitRev", () => {
        test.each([
            undefined,
            null,
            "",
            " ",
            "1.0",
            "1.x",
            "x.y.z",
            "1.2-beta",
        ])("when version %p, returns false", (version) => {
            // Arrange & Act
            const result = Git.commitRev(version as string);

            // Assert
            expect(result).toBeFalse();
        });

        test.each(["1.2.3", "1.0.1-beta", "1.0.1-alpha"])(
            "when version %p, returns true",
            (version) => {
                // Arrange & Act
                const result = Git.commitRev(version);

                // Assert
                expect(result).toBeTrue();
            }
        );
    });

    // #endregion commitRev

    // -----------------------------------------------------------------------------------------
    // #region push
    // -----------------------------------------------------------------------------------------

    describe("push", () => {
        test("calls git push", () => {
            // Arrange
            const shellExecSpy = jest.spyOn(shell, "exec");
            const expected = "git push";

            // Act
            Git.push();

            // Assert
            expect(shellExecSpy).toBeCalledWith(expected);
        });

        test("when options.dryRun true, calls git push with --dry-run flag", () => {
            // Arrange
            const shellExecSpy = jest.spyOn(shell, "exec");
            const expected = "git push --dry-run";

            // Act
            Git.push({ dryRun: true });

            // Assert
            expect(shellExecSpy).toBeCalledWith(expected);
        });
    });

    // #endregion push
});

// #endregion Tests
