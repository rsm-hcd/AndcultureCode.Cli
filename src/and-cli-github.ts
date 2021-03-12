#!/usr/bin/env node

import program from "commander";
import { CommandDefinitions } from "./modules/command-definitions";
import { CommandRegistry } from "./modules/command-registry";

// -----------------------------------------------------------------------------------------
// #region Entrypoint
// -----------------------------------------------------------------------------------------

CommandRegistry.registerAll(CommandDefinitions.github.children);

program.description(CommandDefinitions.github.description).parse(process.argv);

// #endregion Entrypoint
