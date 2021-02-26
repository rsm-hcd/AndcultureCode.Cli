import { Interface as ReadlineInterface } from "readline";

// -----------------------------------------------------------------------------------------
// #region Interface
// -----------------------------------------------------------------------------------------

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
