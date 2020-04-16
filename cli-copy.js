#!/usr/bin/env node
require("./command-runner").run(async () => {
    /**************************************************************************************************
     * Imports
     **************************************************************************************************/

    const commands = require("./_modules/commands");
    const echo = require("./_modules/echo");
    const program = require("commander");
    const shell = require("shelljs");

    /**************************************************************************************************
     * Commands
     **************************************************************************************************/

    // #region Copy commands

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
        run(source, destination, options) {

            echo.message(`Copying '${source}' to '${destination}'...`);

            let result = null;

            if (options !== undefined && options !== null) {
                echo.message(` - Options: ${options}`);
                result = shell.cp(options, source, destination);
            } else {
                result = shell.cp(source, destination);
            }

            if (result.code !== 0) {
                echo.error("Copy failed");
                shell.exit(result.code);
            }

            echo.success("Copy successful");
        },
    }

    // #endregion Copy commands

    /**************************************************************************************************
     * Entrypoint / Command router
     **************************************************************************************************/

    // #region Entrypoint / Command router

    program
        .usage("option(s)")
        .description(commands.copy.description)
        .option("-d, --destination <destination>", "Required destination directory path")
        .option("-f, --flags <options>", "Optional flags when copying (See https://github.com/shelljs/shelljs 'cp')")
        .option("-s, --source <source>", "Required source file or directory path")
        .parse(process.argv);

    if (program.source && program.destination) {
        copy.run(program.source, program.destination, program.flags);
    }

    // If no options are passed in, output help
    if (process.argv.slice(2).length === 0) { program.help(); }

    // #endregion Entrypoint / Command router
});
