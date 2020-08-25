// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const commandStringFactory = require("./command-string-factory");
const testUtils = require("../tests/test-utils");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("commandStringFactory", () => {
    // -----------------------------------------------------------------------------------------
    // #region build
    // -----------------------------------------------------------------------------------------

    describe("build", () => {
        test.each([undefined, null, "", " "])(
            "given '%s' as a command, it exits with a non-zero exit code",
            (value) => {
                // Arrange
                const shellExitSpy = testUtils.spyOnShellExit();

                // Act
                commandStringFactory.build(value);

                // Assert
                expect(shellExitSpy).toHaveBeenCalledWith(1);
            }
        );

        test.each([undefined, null, "", " "])(
            "given '%s' as an arg, it returns an object without that value in the args array",
            (arg) => {
                // Arrange
                const command = testUtils.randomWord();

                // Act
                const result = commandStringFactory.build(command, arg);

                // Assert
                expect(result.args).toHaveLength(0);
            }
        );

        test("given a command and args, it returns a string-like object with concatenated values", () => {
            // Arrange
            const command = testUtils.randomWord();
            const args = [
                testUtils.randomWord(),
                testUtils.randomWord(),
                testUtils.randomWord(),
            ];
            const expectedString = `${command} ${args.join(" ")}`;

            // Act
            const result = commandStringFactory.build(command, ...args);

            // Assert
            expect(result.toString()).toBe(expectedString); // Checking String.toString() value equality
            expect(result.valueOf()).toBe(expectedString); // Checking String.valueOf() value equality
        });

        test("given a command and args, it returns an object with 'cmd' and 'args' properties", () => {
            // Arrange
            const command = testUtils.randomWord();
            const args = [
                testUtils.randomWord(),
                testUtils.randomWord(),
                testUtils.randomWord(),
            ];

            // Act
            const result = commandStringFactory.build(command, ...args);

            // Assert
            expect(result.cmd).toBe(command);
            expect(result.args).toStrictEqual(args);
        });
    });

    // #endregion build
});

// #endregion Tests
