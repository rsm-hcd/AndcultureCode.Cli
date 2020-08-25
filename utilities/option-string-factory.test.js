// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const faker = require("faker");
const optionStringFactory = require("./option-string-factory");
const testUtils = require("../tests/test-utils");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("optionStringFactory", () => {
    // -----------------------------------------------------------------------------------------
    // #region build
    // -----------------------------------------------------------------------------------------

    describe("build", () => {
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
                const shellExitSpy = testUtils.spyOnShellExit();

                // Act
                optionStringFactory.build(option, shortFlag);

                // Assert
                expect(shellExitSpy).toHaveBeenCalledWith(1);
            }
        );

        test("given an option starting with '--', it returns a string-like object without an additional '--'", () => {
            // Arrange
            const option = `--${testUtils.randomWord()}`;

            // Act
            const result = optionStringFactory.build(option);

            // Assert
            expect(result.toString()).toBe(option);
        });

        test("given an option without '--', it returns a string-like object with '--' prepended", () => {
            // Arrange
            const option = testUtils.randomWord();

            // Act
            const result = optionStringFactory.build(option);

            // Assert
            expect(result.toString()).toBe(`--${option}`);
        });

        test("given a shortFlag starting with '-', it returns a string-like object without an additional '-'", () => {
            // Arrange
            const shortFlag = `-${faker.random.alphaNumeric(1)}`;

            // Act
            const result = optionStringFactory.build(null, shortFlag);

            // Assert
            expect(result.toString()).toBe(shortFlag);
        });

        test("given a shortFlag without '-', it returns a string-like object with '-' prepended", () => {
            // Arrange
            const shortFlag = faker.random.alphaNumeric(1);

            // Act
            const result = optionStringFactory.build(null, shortFlag);

            // Assert
            expect(result.toString()).toBe(`-${shortFlag}`);
        });

        test("given a shortFlag of length >= 2, it exits with a non-zero exit code", () => {
            // Arrange
            const invalidShortFlag = faker.random.alphaNumeric(2);
            const shellExitSpy = testUtils.spyOnShellExit();

            // Act
            optionStringFactory.build(null, invalidShortFlag);

            // Assert
            expect(shellExitSpy).toHaveBeenCalledWith(1);
        });

        test("given both an option and shortFlag, it returns a string-like object with concatenated values", () => {
            // Arrange
            const option = testUtils.randomWord();
            const shortFlag = faker.random.alphaNumeric(1);

            // Act
            const result = optionStringFactory.build(option, shortFlag);

            // Assert
            expect(result.toString()).toBe(`-${shortFlag}, --${option}`);
        });

        test("given both an option and shortFlag, it returns an object with 'option' and 'shortFlag' properties", () => {
            // Arrange
            const option = testUtils.randomWord();
            const shortFlag = faker.random.alphaNumeric(1);

            // Act
            const result = optionStringFactory.build(option, shortFlag);

            // Assert
            expect(result.option).toBe(`--${option}`);
            expect(result.shortFlag).toBe(`-${shortFlag}`);
        });

        test("given both an option and shortFlag, it returns an object with a 'toArray' function", () => {
            // Arrange
            const option = testUtils.randomWord();
            const shortFlag = faker.random.alphaNumeric(1);

            // Act
            const result = optionStringFactory.build(option, shortFlag);

            // Assert
            expect(result.toArray()).toStrictEqual([
                `-${shortFlag}`,
                `--${option}`,
            ]);
        });
    });

    // #endregion build
});

// #endregion Tests
