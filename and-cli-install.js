#!/usr/bin/env node

require("./command-runner").run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Imports
    // -----------------------------------------------------------------------------------------

    const { CLI_NAME, ENTRYPOINT } = require("./modules/constants");
    const commands = require("./modules/commands");
    const echo = require("./modules/echo");
    const file = require("./modules/file");
    const formatters = require("./modules/formatters");
    const packageConfig = require("./modules/package-config");
    const program = require("commander");
    const shell = require("shelljs");
    const upath = require("upath");

    // #endregion Imports

    // -----------------------------------------------------------------------------------------
    // #region Constants
    // -----------------------------------------------------------------------------------------

    const { purple } = formatters;

    // #endregion Constants

    // -----------------------------------------------------------------------------------------
    // #region Public Functions
    // -----------------------------------------------------------------------------------------

    const install = {
        cmd(package) {
            return `npm install --global ${package}`;
        },
        description() {
            return "Configures development machine with global npm, project-specific and developer and-cli tools";
        },
        run() {
            // Local project (likely a plugin CLI) global install
            const binName = packageConfig.getLocalBinName();
            if (binName !== CLI_NAME) {
                _installLocalProjectGlobally();
            }

            // Global npm package
            echo.message(`Installing ${CLI_NAME} as global npm tool...`);
            shell.exec(this.cmd(CLI_NAME));
            echo.success("Successfully installed globally");
            echo.newLine();

            // Project-specific alias
            echo.message(
                `Configuring project-specific '${CLI_NAME}' bash alias...`
            );
            const projectAlias = `alias ${CLI_NAME}='npx ${CLI_NAME}'`;

            if (
                shell.cat(file.bashFile()).grep(projectAlias).stdout.length > 1
            ) {
                echo.success(`${CLI_NAME} bash alias already installed`);
            } else {
                shell.echo("").toEnd(file.bashFile());
                shell
                    .echo(`# ${CLI_NAME} project-level alias`)
                    .toEnd(file.bashFile());
                shell.echo(projectAlias).toEnd(file.bashFile());
                echo.success(`Successfully installed ${CLI_NAME} bash alias`);
            }
            echo.newLine();

            // Developer alias
            echo.message(
                `Configuring cli development '${CLI_NAME}-dev' bash alias...`
            );
            const pathToCli = upath.join(shell.pwd().toString(), ENTRYPOINT);
            const developerAlias = `alias ${CLI_NAME}-dev='${pathToCli}'`;

            if (
                shell.cat(file.bashFile()).grep(developerAlias).stdout.length >
                1
            ) {
                echo.success(`${CLI_NAME}-dev bash alias already installed`);
            } else {
                shell.echo("").toEnd(file.bashFile());
                shell
                    .echo(
                        `# ${CLI_NAME} global development alias pointing to your fork of the repository`
                    )
                    .toEnd(file.bashFile());
                shell.echo(developerAlias).toEnd(file.bashFile());
                echo.success(`Successfully installed ${CLI_NAME}-dev alias`);
            }

            // Reload shell
            echo.newLine();
            echo.success(
                "Install successful. Reload your shell for changes to take effect"
            );
        },
    };

    // #endregion Public Functions

    // -----------------------------------------------------------------------------------------
    // #region Private Functions
    // -----------------------------------------------------------------------------------------

    const _installLocalProjectGlobally = () => {
        const cmd = install.cmd(".");
        echo.message(
            `Installing current project as a global npm tool... (via ${cmd})`
        );
        const { code } = shell.exec(cmd);
        if (code !== 0) {
            echo.error(`There was an error installing the package: ${code}`);
            shell.exit(code);
        }

        echo.success("Current project was successfully installed globally");
        echo.message(
            `You should now be able to run it from any directory with: ${purple(
                `${binName} <command>`
            )}`
        );
    };

    // #endregion Private Functions

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option(s)")
        .description(commands.install.description)
        .parse(process.argv);

    // If no options are passed in, performs installation steps
    if (process.argv.slice(2).length === 0) {
        install.run();
    }

    // #endregion Entrypoint
});
