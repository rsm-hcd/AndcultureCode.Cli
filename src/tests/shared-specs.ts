import { TestUtils } from "../tests/test-utils";
import { Constants } from "../modules/constants";
import { Formatters } from "../modules/formatters";
import { EOL } from "os";

// -----------------------------------------------------------------------------------------
// #region Public Functions
// -----------------------------------------------------------------------------------------

/**
 * Describe/test block for testing functionality of a command triggered by one or more options
 * from an array.
 *
 * @param {string[]} options Array of options to generate `describe` blocks for. Usually a string.
 * @param {(option: string) => void} fn Function to be run nested under the generated `describe` block. Can be
 * a test case or another `describe` block.
 */
const givenOptions = (options: string[], fn: (option: string) => void) => {
    // Intentionally looping over each passed in option and calling describe() vs. using
    // describe.each() - async functions (tests) being passed in were running at the same time and
    // failing. Calling each describe manually seems to force them to run synchronously.
    options.forEach((option: string) => {
        describe(`given '${option}'`, () => {
            fn(option);
        });
    });
};

/**
 * Test spec ensuring that the given command properly displays the help menu provided by Commander
 *
 * This can be used as a simple 'health check' for parent-level commands to ensure they do not throw
 * runtime errors.
 *
 * @param {string} command The cli command to be run, such as `dotnet` or `webpack`
 * @param {string[]} args Additional args to pass to the command being run, such as `["aws-s3"]`
 * for the `deploy` command
 * @param {boolean=false} debug Optional flag to print the output from the command to the console.
 * @returns
 */
const shouldDisplayHelpMenu = (
    command: string,
    args: string[] = [],
    debug: boolean = false
) =>
    givenOptions(Constants.HELP_OPTIONS, (option: string) => {
        test("it displays the help menu", async () => {
            // Arrange & Act
            const result = await TestUtils.executeCliCommand(command, [
                ...args,
                option,
            ]);

            // Assert
            if (debug) {
                console.debug(
                    `${Formatters.yellow(
                        `TestUtils.shouldDisplayHelpMenu ${command} ${args}`
                    )}${EOL}${EOL}${result}`
                );
            }
            expect(result).toContain(Constants.HELP_DESCRIPTION);
        });
    });

/**
 * Test spec ensuring that the given function properly returns the error string when run.
 * Defaults to the error constant specified for `echo.error()`, but can be overridden for a more
 * specific error message if needed.
 *
 * @param {async () => string} fn Function to run as the arrange & act steps of the test case. Should return
 * the output to be asserted against.
 * @param {string} [error=ERROR_OUTPUT_STRING] Error message to check for in the result output.
 */
const shouldDisplayError = (
    fn: Function,
    error = Constants.ERROR_OUTPUT_STRING
) => {
    test("it displays an error", async () => {
        // Arrange & Act
        const result = await fn();

        // Assert
        expect(result).toContain(error);
    });
};

/**
 * Custom bundling of setup/teardown for a test suite or describe block requiring a temporary directory.
 * Returns the name of the temporary directory and cleanup function if needed for the execution of the test,
 * but will always attempt to run the cleanup function in the `afterEach` step regardless.
 *
 * @param {string} [prefix=""] Optional prefix for the temporary directory to use. Temporary directory
 * is always prefixed with `tmp-`
 * @param {(tmpDir: string) => void} beforeEachFn Optional function to be run at the start of the `beforeEach` block
 * (after the temporary directory has been created)
 * @param {(tmpDir: string) => void} afterEachFn Optional function to be run at the start of the `afterEach` block
 * (before the temporary directory has been cleaned)
 * @returns
 */
const withTemporaryDirectory = (
    prefix: string = "",
    beforeEachFn?: (tmpDir: string) => void,
    afterEachFn?: (tmpDir: string) => void
) => {
    let _tmpDir = "";
    let _cleanupTmpDir = () => {};

    beforeEach(() => {
        // Before each test, create a temporary directory for the test to work with. We can muck around
        // for lifetime of the test and it will be cleaned up in the 'afterEach' hook.
        const { tmpDir, cleanupTmpDir } = TestUtils.createAndUseTmpDir(prefix);

        if (beforeEachFn != null) {
            beforeEachFn(tmpDir);
        }

        // Save references to the temporary directory and cleanup function to return to the test instance
        _tmpDir = tmpDir;
        _cleanupTmpDir = cleanupTmpDir;
    });

    afterEach(() => {
        if (afterEachFn != null) {
            afterEachFn(_tmpDir);
        }

        _cleanupTmpDir();
    });
};

// #endregion Public Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export {
    givenOptions,
    shouldDisplayError,
    shouldDisplayHelpMenu,
    withTemporaryDirectory,
};

// #endregion Exports
