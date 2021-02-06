import shell from "shelljs";
import { Constants } from "./modules/constants";
import program from "commander";
import { CommandRegistry } from "./modules/command-registry";
import upath from "upath";

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

const deployCommandPattern = `${Constants.CLI_NAME}-deploy-`;

const deployTypes = shell
    .ls(__dirname)
    .filter(
        (file: string) =>
            file.startsWith(deployCommandPattern) &&
            // Filter out any test files or typescript definitions
            !file.includes("test") &&
            !file.endsWith(".ts")
    )
    .map((file: string) => upath.trimExt(file.split(deployCommandPattern)[1]));

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Entrypoint
// -----------------------------------------------------------------------------------------

program.description("Runs deployments for various application types");

CommandRegistry.registerAll(
    deployTypes.map((deployType: string) => {
        return {
            command: deployType,
            description: `Run deployments for ${deployType}`,
        };
    })
);

program.parse(process.argv);

// #endregion Entrypoint
