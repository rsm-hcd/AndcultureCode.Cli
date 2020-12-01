import { CommandStringBuilder } from "../utilities/command-string-builder";
import { OptionStringBuilder } from "../utilities/option-string-builder";
import { DotnetBuild } from "./dotnet-build";
import { DotnetPath } from "./dotnet-path";
import { Echo } from "./echo";
import { Formatters } from "./formatters";
import upath from "upath";
import child_process from "child_process";
import { Dir } from "./dir";
import shell from "shelljs";

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const DotnetCli = {
    cmd(cliArgs: string[] = []): CommandStringBuilder {
        const pathName = upath.basename(DotnetPath.cliPath() ?? "");
        return new CommandStringBuilder("dotnet", pathName, ...cliArgs);
    },
    description() {
        return (
            `Shortcut that forwards any/all Dotnet Cli commands to be run in the correct location in the project (via ${this.cmd()}) ` +
            Formatters.tabbedNewLine(
                Formatters.red("NOTE: ") +
                    "Arguments should be passed through prefixed with '--', ie 'and-cli dotnet --cli -- test db migrate'"
            )
        );
    },
    getOptions(): OptionStringBuilder {
        return new OptionStringBuilder("cli", "C");
    },
    run(cliArgs: string[] = []) {
        const cliDir = DotnetPath.cliDir();

        // Build dotnet project if the *Cli.dll is not found
        if (cliDir == null) {
            Echo.warn("No Cli.dll found. Building project");
            DotnetBuild.run(true, true);
        }

        Dir.pushd(cliDir!);

        const { cmd, args } = this.cmd(cliArgs);

        Echo.success(`Full command:` + this.cmd(cliArgs).toString());
        const { status } = child_process.spawnSync(cmd, args, {
            stdio: "inherit",
            shell: true,
        });

        if (status != null && status !== 0) {
            Echo.error("Command failed, see output for details.");
            shell.exit(status);
        }

        Dir.popd();
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { DotnetCli };

// #endregion Exports
