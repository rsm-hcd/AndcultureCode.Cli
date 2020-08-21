// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const formatters = require("./formatters");
const readline = require("readline-promise").default;
const shell = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

let cachedPrompt;

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const prompt = {
    /**
     * Prompts the user for confirmation, and exits if the user does not type y or Y.
     *
     * @param {*} question Question to pose to the user
     * @param {number} [exitStatus=0] Exit status to pass to shelljs if confirmation unsccessful
     */
    async confirmOrExit(question, exitStatus = 0) {
        const prompt = this.getPrompt();

        const answer = await prompt.questionAsync(
            `${question} ${formatters.yellow("(y/N)")}: `
        );
        if (!answer.match(/[yY]/)) {
            shell.exit(exitStatus);
        }
    },

    /**
     * Creates and returns a readline interface for accessing stdin/stdout. Returns a cached version if already
     * created.
     *
     */
    getPrompt() {
        if (cachedPrompt !== undefined) {
            return cachedPrompt;
        }

        cachedPrompt = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        return cachedPrompt;
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = prompt;

// #endregion Exports
