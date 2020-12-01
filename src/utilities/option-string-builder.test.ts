import { TestUtils } from "../tests/test-utils";
import { OptionStringBuilder } from "./option-string-builder";
import faker from "faker";

test("it passes", () => {
    expect(true).toBeTrue();
});

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("OptionStringBuilder", () => {
    // -----------------------------------------------------------------------------------------
    // #region option & shortFlag
    // -----------------------------------------------------------------------------------------

    describe("option & shortFlag", () => {
        test("given both an option and shortFlag, it returns an object with 'option' and 'shortFlag' properties", () => {
            // Arrange
            const option = TestUtils.randomWord();
            const shortFlag = faker.random.alphaNumeric(1);

            // Act
            const result = new OptionStringBuilder(option, shortFlag);

            // Assert
            expect(result.option).toBe(`--${option}`);
            expect(result.shortFlag).toBe(`-${shortFlag}`);
        });
    });

    // #endregion option & shortFlag

    // -----------------------------------------------------------------------------------------
    // #region toString
    // -----------------------------------------------------------------------------------------

    describe("toString", () => {
        test.each([
            [undefined, undefined],
            [undefined, null],
            [undefined, ""],
            [undefined, " "],
            [null, undefined],
            [null, null],
            [null, ""],
            [null, " "],
            ["", undefined],
            ["", null],
            ["", ""],
            ["", " "],
            [" ", undefined],
            [" ", null],
            [" ", ""],
            [" ", " "],
        ])(
            "given option '%s' and shortFlag '%s', it exits with a non-zero exit code",
            (option, shortFlag) => {
                // Arrange
                const shellExitSpy = TestUtils.spyOnShellExit();

                // Act
                new OptionStringBuilder(
                    option as string,
                    shortFlag as string
                ).toString();

                // Assert
                expect(shellExitSpy).toHaveBeenCalledWith(1);
            }
        );

        test("given an option starting with '--', it returns a string without an additional '--'", () => {
            // Arrange
            const option = `--${TestUtils.randomWord()}`;

            // Act
            const result = new OptionStringBuilder(option).toString();

            // Assert
            expect(result).toBe(option);
        });

        test("given an option without '--', it returns a string with '--' prepended", () => {
            // Arrange
            const option = TestUtils.randomWord();

            // Act
            const result = new OptionStringBuilder(option).toString();

            // Assert
            expect(result).toBe(`--${option}`);
        });

        test("given a shortFlag starting with '-', it returns a string without an additional '-'", () => {
            // Arrange
            const shortFlag = `-${faker.random.alphaNumeric(1)}`;

            // Act
            const result = new OptionStringBuilder(
                undefined,
                shortFlag
            ).toString();

            // Assert
            expect(result).toBe(shortFlag);
        });

        test("given a shortFlag without '-', it returns a string with '-' prepended", () => {
            // Arrange
            const shortFlag = faker.random.alphaNumeric(1);

            // Act
            const result = new OptionStringBuilder(
                undefined,
                shortFlag
            ).toString();

            // Assert
            expect(result).toBe(`-${shortFlag}`);
        });

        test("given a shortFlag of length >= 2, it exits with a non-zero exit code", () => {
            // Arrange
            const invalidShortFlag = faker.random.alphaNumeric(2);
            const shellExitSpy = TestUtils.spyOnShellExit();

            // Act
            new OptionStringBuilder(undefined, invalidShortFlag).toString();

            // Assert
            expect(shellExitSpy).toHaveBeenCalledWith(1);
        });

        test("given both an option and shortFlag, it returns a string with concatenated values", () => {
            // Arrange
            const option = TestUtils.randomWord();
            const shortFlag = faker.random.alphaNumeric(1);

            // Act
            const result = new OptionStringBuilder(
                option,
                shortFlag
            ).toString();

            // Assert
            expect(result).toBe(`-${shortFlag}, --${option}`);
        });
    });

    // #endregion toString

    // -----------------------------------------------------------------------------------------
    // #region toArray
    // -----------------------------------------------------------------------------------------

    test("given both an option and shortFlag, it returns an array with both values", () => {
        // Arrange
        const option = TestUtils.randomWord();
        const shortFlag = faker.random.alphaNumeric(1);

        // Act
        const result = new OptionStringBuilder(option, shortFlag).toArray();

        // Assert
        expect(result).toStrictEqual([`-${shortFlag}`, `--${option}`]);
    });

    // #endregion toArray
});

// #endregion Tests
