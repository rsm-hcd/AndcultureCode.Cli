#!/usr/bin/env node

import { CommandDefinitions } from "./modules/command-definitions";
import { CommandRunner } from "./modules/command-runner";
import { Echo } from "./modules/echo";
import { Js } from "./modules/js";
import program from "commander";
import fetch from "node-fetch";
import shell from "shelljs";
import { StringUtils } from "andculturecode-javascript-core";

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const ERROR_MISSING_ENDPOINT = "Please provide a url to verify";
const CODE_DESCRIPTION = "Desired response code to wait for.";
const TIMEOUT_DESCRIPTION =
    "Optional length in ms to wait for the operation to complete";
const INTERVAL_DESCRIPTION = "Optional length in ms to wait between operations";

// #endregion Constants

CommandRunner.run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Variables
    // -----------------------------------------------------------------------------------------

    let code: number;
    let endpoint: string;
    let responseCode: number;
    let timeout: number;
    let interval: number;

    // #endregion Variables

    // -----------------------------------------------------------------------------------------
    // #region Functions
    // -----------------------------------------------------------------------------------------
    const healthCheck = {
        async checkHost(elapsed: number) {
            Echo.message(
                `Pinging for HTTP ${code} (${elapsed / 1000}s) of ${timeout /
                    1000}s...`
            );

            const response = await fetch(endpoint);
            const { status } = response;

            if (status == code) {
                Echo.success("Verified Host!");
                shell.exit(0);
            }

            Echo.message(`Returned with HTTP ${status}. Retrying...`);
        },

        async run() {
            timeout = program.timeout;
            interval = program.interval;
            code = program.code;

            Echo.message(`Checking host: ${endpoint}`);

            await Js.waitFor(this.checkHost, interval, timeout, () => {
                Echo.error("Timed out waiting for the host");
                shell.exit(1);
            });

            shell.exit(1);
        },
    };
    // #endregion Functions

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .description(CommandDefinitions.healthCheck.description)
        .arguments("<endpoint>")
        .usage("and-cli health-check <endpoint> option(s)")
        .option("--code <code>", CODE_DESCRIPTION, "200")
        .option("--timeout <timeout>", TIMEOUT_DESCRIPTION, "60000")
        .option("--interval <interval>", INTERVAL_DESCRIPTION, "1000")
        .parse(process.argv);

    // If no options are passed in, just output help
    if (Js.hasNoArguments()) {
        program.help();
    }

    endpoint = program.args[0];

    if (StringUtils.isEmpty(endpoint)) {
        Echo.error(ERROR_MISSING_ENDPOINT);
        shell.exit(1);
    }
    await healthCheck.run();

    // #endregion Entrypoint
});
