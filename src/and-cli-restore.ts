import shell from "shelljs";
import { Constants } from "./modules/constants";
import program from "commander";
import { CommandRegistry } from "./modules/command-registry";
import upath from "upath";

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

const restoreCommandPattern = `${Constants.CLI_NAME}-restore-`;

const restoreTypes = shell
    .ls(__dirname)
    .filter(
        (file: string) =>
            file.startsWith(restoreCommandPattern) &&
            // Filter out any test files or typescript definitions
            !file.includes("test") &&
            !file.endsWith(".ts")
    )
    .map((file: string) => upath.trimExt(file.split(restoreCommandPattern)[1]));

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Entrypoint
// -----------------------------------------------------------------------------------------

program.description("Runs restores for various application types");

CommandRegistry.registerAll(
    restoreTypes.map((deployType: string) => {
        return {
            command: deployType,
            description: `Run restores for ${deployType}`,
        };
    })
);

program.parse(process.argv);

// #endregion Entrypoint
