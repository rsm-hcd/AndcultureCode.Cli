import { Formatters } from "./formatters";
// @ts-expect-error
import readline from "readline-promise";
import shell from "shelljs";
import { Echo } from "./echo";
import { AsyncReadlineInterface } from "../interfaces/async-readline-interface";

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
     * @param question Question to ask the user for input
     * @param exitStatus Exit status to pass to shelljs if confirmation unsuccessful
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

    getInterface(): AsyncReadlineInterface {
        return _getPrompt();
    },

    /**
     * Returns a multiline prompt that returns a string array of the responses. A terminator phrase
     * is required to end the interaction, which defaults to an empty string - hitting enter without
     * any additional input.
     *
     * @param question Question to ask the user for input
     * @param terminatorPhrase String to terminate the input loop
     */
    async multiline(
        question: string,
        terminatorPhrase: string = ""
    ): Promise<string[]> {
        // Trim & lowercase the terminator phrase for comparison
        terminatorPhrase = terminatorPhrase.trim().toLocaleLowerCase();

        const prompt = _getPrompt();

        Echo.message(question, false);

        const handleLineInput = async (line: string) => {
            const trimmedLine = line.trim().toLocaleLowerCase();
            if (trimmedLine !== terminatorPhrase) {
                return await line;
            }

            prompt.close();
            return await "";
        };

        const responses: Promise<string>[] = await prompt.map(handleLineInput);

        return await Promise.all(responses);
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
const _getPrompt = (): AsyncReadlineInterface => {
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
