// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

/**
 * Mocked version of `child_process` module for testing purposes.
 *
 * We don't want to be firing off child processes in unit tests. For integration tests, the
 * 'cmd' module explicitly unmocks the `child_process` module.
 */
const child_process = {
    spawn:     jest.fn(),
    spawnSync: jest.fn(() => {
        return {
            status: 0,
            stderr: "",
            stdout: "",
        };
    }),
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = child_process;

// #endregion Exports
