import { CommandStringBuilder } from "../utilities/command-string-builder";
import { Echo } from "./echo";
import { Ps } from "./ps";
import child_process from "child_process";
import shell from "shelljs";
import { OptionStringBuilder } from "../utilities/option-string-builder";
import { ProcessDescriptor } from "ps-list";

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const DotnetKill = {
    cmd(): CommandStringBuilder {
        return new CommandStringBuilder("dotnet", "build-server", "shutdown");
    },
    description() {
        return `Forcefully kills any running dotnet processes (see https://github.com/dotnet/cli/issues/1327)`;
    },
    getOptions(): OptionStringBuilder {
        return new OptionStringBuilder("kill", "k");
    },
    async run() {
        const { cmd, args } = this.cmd();

        Echo.error(`Stopping dotnet build servers via (${this.cmd()})...`);
        const { status, stderr } = child_process.spawnSync(cmd, args, {
            stdio: "inherit",
            shell: true,
        });

        if (status != null && status !== 0) {
            Echo.error(
                `There was an error shutting down the MSBuild server: ${status} ${stderr}`
            );
            shell.exit(status);
        }

        Echo.success(
            `Finished shutting down build servers: ${status} ${stderr}`
        );

        // Manually gathering process ID list and filtering results vs. just deferring to fkill
        // with a string - something with the regex pattern they are using is invalid in node v8
        const psListResult = await Ps.list("dotnet");

        const dotnetPids = psListResult.map((e: ProcessDescriptor) => e.pid);
        if (dotnetPids.length === 0) {
            Echo.message("No dotnet PIDs found!");
            return true;
        }

        Echo.message(`Force killing dotnet PIDs ${dotnetPids}...`);

        await Ps.kill(dotnetPids);

        Echo.message("Finished force killing lingering dotnet processes.");
        return true;
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { DotnetKill };

// #endregion Exports
