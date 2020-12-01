import { Echo } from "./echo";
import fkill from "fkill";
import psList, { ProcessDescriptor } from "ps-list";
import shell from "shelljs";

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

// FIXME: Look into the Options interface from fkill that doesn't seem to have `silent` property
const _defaultKillOptions = {
    /**
     * Force kill the process.
     */
    force: true,

    /**
     * Ignore capitalization when killing a process.
     *
     * Note that the case is always ignored on Windows.
     */
    ignoreCase: true,

    /**
     * Suppress all error messages. For example: `Process doesn't exist.`
     */
    silent: true,

    /**
     * Kill all child processes along with the parent process. _(Windows only)_
     */
    tree: true,
};

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const Ps = {
    DEFAULT_KILL_OPTIONS: _defaultKillOptions,
    async kill(
        input: number | string | ReadonlyArray<string | number>,
        options = _defaultKillOptions
    ) {
        try {
            await fkill(input, options);
        } catch (error) {
            Echo.error(
                `There was an error killing processes ${input}: ${error}`
            );
            shell.exit(1);
        }

        return 0;
    },
    async list(name?: string): Promise<ProcessDescriptor[]> {
        let processes: ProcessDescriptor[] = [];
        try {
            processes = await psList();
        } catch (error) {
            Echo.error(
                `There was an error retrieving the process list: ${error}`
            );
            shell.exit(1);
        }

        if (name != null) {
            processes = processes.filter((process: ProcessDescriptor) =>
                process.name.match(name)
            );
        }

        return processes;
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { Ps };

// #endregion Exports
