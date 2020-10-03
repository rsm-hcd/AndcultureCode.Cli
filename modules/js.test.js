// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const faker = require("faker");
const js = require("./js");
const nock = require("nock");
const shell = require("shelljs");
const testUtils = require("../tests/test-utils");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("js", () => {
    // -----------------------------------------------------------------------------------------
    // #region waitFor
    // -----------------------------------------------------------------------------------------

    describe("waitFor", () => {
        test.each`
            invalidValue
            ${null}
            ${undefined}
        `(
            "when callbackAsync $invalidValue, throws error",
            async ({ invalidValue }) => {
                // Arrange
                let hasError = false;
                const interval = faker.random.number({ max: 5 });
                const duration = faker.random.number({ max: 5 });

                // Act
                try {
                    await js.waitFor(invalidValue, interval, duration);
                } catch (e) {
                    hasError = true;
                }

                // Assert
                expect(hasError).toBeTrue();
            }
        );

        test.each`
            invalidValue
            ${0}
            ${-1}
            ${-100}
        `(
            "when interval $invalidValue, throws error",
            async ({ invalidValue }) => {
                // Arrange
                let hasError = false;
                const callback = () => {}; // placeholder
                const duration = faker.random.number({ max: 5 });

                // Act
                try {
                    await js.waitFor(() => {}, invalidValue, duration);
                } catch (e) {
                    hasError = true;
                }

                // Assert
                expect(hasError).toBeTrue();
            }
        );

        test("when duration less than or equal to 0, callback immediately invoked", async () => {
            // Arrange
            const duration = faker.random.number({ min: -10, max: 0 });
            let elapsedTime = 0;
            const interval = 10;

            // Act
            const result = await js.waitFor(
                (elapsed) => {
                    elapsedTime = elapsed;
                    return true;
                },
                interval,
                duration
            );

            // Assert
            expect(elapsedTime).toBe(0);
        });

        test("when callback returns true, finishes without timeout", async () => {
            // Arrange
            const duration = 10;
            const interval = 1;
            let callbackCount = 0;
            const callback = () => {
                callbackCount++;
                return true; // <------ should cause waiting to finish
            };
            let isTimeout = false;

            // Act
            const result = await js.waitFor(
                callback,
                interval,
                duration,
                function timeout() {
                    isTimeout = true;
                }
            );

            // Assert
            expect(callbackCount).toBe(1);
            expect(isTimeout).toBeFalse();
        });

        test("when callback returns false, calls timeout", async () => {
            // Arrange
            const duration = 10;
            const interval = 2;
            let callbackCount = 0;
            const callback = () => {
                callbackCount++;
                return false; // <------ should never finish
            };
            let isTimeout = false;

            // Act
            const result = await js.waitFor(
                callback,
                interval,
                duration,
                function timeout() {
                    isTimeout = true;
                }
            );

            // Assert
            expect(callbackCount).toBeGreaterThanOrEqual(
                1 // give it a little padding so we don't mistakenly error for runtime variability
            );
            expect(isTimeout).toBeTrue();
        });
    });

    // #endregion waitFor
});

// #endregion Tests
