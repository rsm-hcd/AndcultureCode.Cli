// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const { CoreUtils } = require("andculturecode-javascript-core");
const echo = require("./echo");
const fs = require("fs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const js = {
    /**
     * Version of foreach supporting async/await
     * @param {array} array array of objects for which to iterate
     * @param {function} callback function to invoke upon each iteration
     */
    async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    },

    /**
     * Is the current command without arguments?
     */
    hasNoArguments() {
        return process.argv.slice(2).length === 0;
    },

    /**
     * Invokes provided callback at the supplied interval until a duration is met
     *
     * The callback will be invoked immediately.
     * @param {function} callbackAsync async function to evaluates every interval. if function returns 'true', wait period is ended.
     *      provided function is also provided the current elapsed time.
     * @param {number} interval number of milliseconds to wait between invocations of 'callback'
     * @param {number} [duration] duration of attempts in milliseconds
     * @param {function} [timeoutCallback] function invoked if the duration is met. callback is provided exact elapsed time
     */
    async waitFor(callbackAsync, interval, duration, timeoutCallback) {
        if (callbackAsync == null) {
            throw new Error("callback is required");
        }

        if (interval == null || interval <= 0) {
            throw new Error("interval must be greater than zero");
        }

        if (duration == null || duration <= 0) {
            await callbackAsync(0);
            return;
        }

        const startTime = new Date();
        let elapsedTime = 0;

        while (true) {
            if ((await callbackAsync(elapsedTime)) === true) {
                return;
            }

            await CoreUtils.sleep(interval);

            elapsedTime = new Date() - startTime;
            if (elapsedTime < duration) {
                continue;
            }

            // Timeout reached, inform interested parties and exit
            if (timeoutCallback != null) {
                timeoutCallback(elapsedTime);
            }

            return;
        }
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = js;

// #endregion Exports
