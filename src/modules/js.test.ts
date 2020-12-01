import faker from "faker";
import { Js } from "./js";

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("Js", () => {
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
                    await Js.waitFor(invalidValue, interval, duration);
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
                    await Js.waitFor(callback, invalidValue, duration);
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
            await Js.waitFor(
                (elapsed: number) => {
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
            await Js.waitFor(callback, interval, duration, function timeout() {
                isTimeout = true;
            });

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
            await Js.waitFor(callback, interval, duration, function timeout() {
                isTimeout = true;
            });

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
