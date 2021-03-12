import program from "commander";
import { CommandRegistry } from "./modules/command-registry";
import { CommandDefinitions } from "./modules/command-definitions";

// -----------------------------------------------------------------------------------------
// #region Entrypoint
// -----------------------------------------------------------------------------------------

CommandRegistry.registerAll(CommandDefinitions.deploy.children);
program.description(CommandDefinitions.deploy.description).parse(process.argv);

// #endregion Entrypoint
