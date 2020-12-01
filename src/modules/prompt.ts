import { Formatters } from "./formatters";
// @ts-expect-error
import readline from "readline-promise";
import shell from "shelljs";

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

let cachedPrompt: any;

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const Prompt = {
    /**
     * Prompts the user for confirmation, and exits if the user does not type y or Y.
     *
     * @param {string} question Question to pose to the user
     * @param {number} [exitStatus=0] Exit status to pass to shelljs if confirmation unsuccessful
     */
    async confirmOrExit(question: string, exitStatus: number = 0) {
        const prompt = _getPrompt();

        const answer = await prompt.questionAsync(
            `${question} ${Formatters.yellow("(y/N)")}: `
        );
        if (!answer.match(/[yY]/)) {
            shell.exit(exitStatus);
        }
    },

    /**
     * Wrapper function around the underlying `prompt.questionAsync` function to reduce the amount of
     * work a consumer has to do to prompt the user
     *
     * @param question Question to ask the user for input
     */
    async questionAsync(question: string): Promise<string> {
        const prompt = _getPrompt();
        return await prompt.questionAsync(question);
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

/**
 * Creates and returns a readline interface for accessing stdin/stdout. Returns a cached version if
 * already created.
 *
 */
const _getPrompt = () => {
    if (cachedPrompt != null) {
        return cachedPrompt;
    }

    cachedPrompt = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return cachedPrompt;
};

// #endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { Prompt };

// #endregion Exports
