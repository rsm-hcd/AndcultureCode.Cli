#!/usr/bin/env node

import { CommandRunner } from "./modules/command-runner";
import { CommandDefinitions } from "./modules/command-definitions";
import program from "commander";
import { Options } from "./constants/options";
import { ListCommands } from "./modules/list-commands";

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const { DEFAULT_OPTIONS } = ListCommands;
const {
    includeHelp: DEFAULT_INCLUDE_HELP,
    indent: DEFAULT_INDENT,
    prefix: DEFAULT_PREFIX,
    skipCache: DEFAULT_SKIP_CACHE,
    useColor: DEFAULT_USE_COLOR,
} = DEFAULT_OPTIONS;

// #endregion Constants

CommandRunner.run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .description(CommandDefinitions.ls.description)
        .option(
            "-i, --indent <indent>",
            "Number of spaces to indent each level",
            DEFAULT_INDENT.toString()
        )
        .option(
            "--include-help",
            `Include the help option for each command`,
            DEFAULT_INCLUDE_HELP
        )
        .option(
            "--no-color",
            "Do not colorize command/options in output",
            !DEFAULT_USE_COLOR
        )
        .option(
            "-p, --prefix <prefix>",
            "Prefix to display before each command/option",
            DEFAULT_PREFIX
        )
        .option(
            "--skip-cache",
            "Skip attempting to read cached command list file",
            DEFAULT_SKIP_CACHE
        )
        .parse(process.argv);

    const { color, includeHelp, indent, prefix, skipCache } = program.opts();

    ListCommands.run({
        skipCache,
        includeHelp,
        indent: Number.parseInt(indent),
        prefix,
        useColor: color,
    });

    // #endregion Entrypoint
});
