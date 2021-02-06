import { TestUtils } from "../tests/test-utils";
import { CommandStringBuilder } from "./command-string-builder";

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("CommandStringBuilder", () => {
    // -----------------------------------------------------------------------------------------
    // #region cmd & args
    // -----------------------------------------------------------------------------------------

    describe("cmd & args", () => {
        test.each([undefined, null, "", " "])(
            "given '%s' as an arg, it returns an object without that value in the args array",
            (arg) => {
                // Arrange
                const command = TestUtils.randomWord();

                // Act
                const result = new CommandStringBuilder(command, arg as string);

                // Assert
                expect(result.args).toBeEmpty();
            }
        );

        test("given a command and args, it returns an object with 'cmd' and 'args' properties", () => {
            // Arrange
            const command = TestUtils.randomWord();
            const args = [
                TestUtils.randomWord(),
                TestUtils.randomWord(),
                TestUtils.randomWord(),
            ];

            // Act
            const result = new CommandStringBuilder(command, ...args);

            // Assert
            expect(result.cmd).toBe(command);
            expect(result.args).toStrictEqual(args);
        });
    });

    // #endregion cmd & args

    // -----------------------------------------------------------------------------------------
    // #region toString
    // -----------------------------------------------------------------------------------------

    describe("toString", () => {
        test.each([undefined, null, "", " "])(
            "given '%s' as a command, it exits with a non-zero exit code",
            (value) => {
                // Arrange
                const shellExitSpy = TestUtils.spyOnShellExit();

                // Act
                new CommandStringBuilder(value as string).toString();

                // Assert
                expect(shellExitSpy).toHaveBeenCalledWith(1);
            }
        );

        test("given a command and args, it returns a string with concatenated values", () => {
            // Arrange
            const command = TestUtils.randomWord();
            const args = [
                TestUtils.randomWord(),
                TestUtils.randomWord(),
                TestUtils.randomWord(),
            ];
            const expectedString = `${command} ${args.join(" ")}`;

            // Act
            const result = new CommandStringBuilder(
                command,
                ...args
            ).toString();

            // Assert
            expect(result).toBe(expectedString);
        });
    });

    // #endregion toString
});

// #endregion Tests
