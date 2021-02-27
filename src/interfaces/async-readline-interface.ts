import { Interface as ReadlineInterface } from "readline";

// -----------------------------------------------------------------------------------------
// #region Interface
// -----------------------------------------------------------------------------------------

/**
 * Custom interface to expose extended API provided by `readline-promise`.
 * Can be removed if/when open issue for TS definitions is resolved
 * @see https://github.com/bhoriuchi/readline-promise/issues/11
 */
interface AsyncReadlineInterface extends ReadlineInterface {
    each: (
        iteratee: (
            line: string,
            index: number,
            lines: string[]
        ) => Promise<void>
    ) => Promise<void>[];

    forEach: (
        iteratee: (
            line: string,
            index: number,
            lines: string[]
        ) => Promise<void>
    ) => Promise<void>[];

    map: (
        iteratee: (
            line: string,
            index: number,
            lines: string[]
        ) => Promise<string>
    ) => Promise<string>[];

    questionAsync: (question: string) => Promise<string>;
}

// #endregion Interface

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { AsyncReadlineInterface };

// #endregion Exports
