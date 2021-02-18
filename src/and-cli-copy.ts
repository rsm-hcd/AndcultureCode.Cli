#!/usr/bin/env node

import { CommandRunner } from "./modules/command-runner";
import { CommandDefinitions } from "./modules/command-definitions";
import { Echo } from "./modules/echo";
import program from "commander";
import shell from "shelljs";
import { Js } from "./modules/js";
import { StringUtils } from "andculturecode-javascript-core";

CommandRunner.run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Functions
    // -----------------------------------------------------------------------------------------

    const copy = {
        description() {
            return "Copies files and/ or directories";
        },

        /**
         * Copy file or folder to target directory
         * @param {string} source Path to source file or directory to copy
         * @param {string} destination Path to output directory
         * @param {string} options Options for the copy operation (See https://github.com/shelljs/shelljs)
         */
        run(source: string, destination: string, options?: string) {
            Echo.message(`Copying '${source}' to '${destination}'...`);

            let result: shell.ShellString;

            if (StringUtils.hasValue(options)) {
                Echo.message(` - Options: ${options}`);
                result = shell.cp(options!, source, destination);
            } else {
                result = shell.cp(source, destination);
            }

            if (result.code !== 0) {
                Echo.error("Copy failed");
                shell.exit(result.code);
            }

            Echo.success("Copy successful");
        },
    };

    // #endregion Functions

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option(s)")
        .description(CommandDefinitions.copy.description)
        .option(
            "-d, --destination <destination>",
            "Required destination directory path"
        )
        .option(
            "-f, --flags <options>",
            "Optional flags when copying (See https://github.com/shelljs/shelljs 'cp')"
        )
        .option(
            "-s, --source <source>",
            "Required source file or directory path"
        )
        .parse(process.argv);

    if (program.source != null && program.destination != null) {
        copy.run(program.source, program.destination, program.flags);
    }

    // If no options are passed in, output help
    if (Js.hasNoArguments()) {
        program.help();
    }

    // #endregion Entrypoint
});
