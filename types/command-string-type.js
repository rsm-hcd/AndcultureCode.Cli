// -----------------------------------------------------------------------------------------
// #region Types
// -----------------------------------------------------------------------------------------

/**
 * An object with a base command, an array of arguments, and an overloaded toString function for
 * debugging or use with `shell.exec`.
 *
 * The split `cmd` and `args` properties are for ease of use with `child_process.spawn` or
 * `child_process.spawnSync`.
 *
 * @typedef {{ args: string[], cmd: string, toString: () => string }} CommandString
 */

// #endregion Types
