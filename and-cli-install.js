#!/usr/bin/env node

require("./command-runner").run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Imports
    // -----------------------------------------------------------------------------------------

    const { CLI_NAME, ENTRYPOINT } = require("./modules/constants");
    const { StringUtils } = require("andculturecode-javascript-core");
    const commands = require("./modules/commands");
    const echo = require("./modules/echo");
    const file = require("./modules/file");
    const formatters = require("./modules/formatters");
    const js = require("./modules/js");
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
            if (StringUtils.hasValue(binName) && binName !== CLI_NAME) {
                _installLocalProjectGlobally(binName);
            }

            // Global npm package
            _installAndCliGlobally();

            // Project-specific alias
            _installNpxAlias();

            // Developer alias
            _installDevAlias();

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

    const _bashFileContains = (text) => {
        return StringUtils.hasValue(
            shell.cat(file.bashFile()).grep(text).stdout
        );
    };

    const _echoInstallErrorAndExit = (code) => {
        echo.error(`There was an error installing the package: ${code}`);
        shell.exit(code);
    };

    const _installAndCliGlobally = () => {
        const cmd = install.cmd(CLI_NAME);
        echo.message(
            `Installing ${CLI_NAME} as global npm tool... (via ${cmd})`
        );

        const { code } = shell.exec(cmd);
        if (code !== 0) {
            _echoInstallErrorAndExit(code);
            return;
        }

        echo.success(`Successfully installed ${CLI_NAME} globally`);
        echo.newLine();
    };

    const _installDevAlias = () => {
        echo.message(
            `Configuring cli development '${CLI_NAME}-dev' bash alias...`
        );
        const pathToCli = upath.join(shell.pwd().toString(), ENTRYPOINT);
        const developerAlias = `alias ${CLI_NAME}-dev='${pathToCli}'`;

        if (_bashFileContains(developerAlias)) {
            echo.success(`${CLI_NAME}-dev bash alias already installed`);
            echo.newLine();
            return;
        }

        _writeToBashFile("");
        _writeToBashFile(
            `# ${CLI_NAME} global development alias pointing to your fork of the repository`
        );
        _writeToBashFile(developerAlias);

        echo.success(`Successfully installed ${CLI_NAME}-dev alias`);
    };

    const _installLocalProjectGlobally = (binName) => {
        const cmd = install.cmd(".");
        echo.message(
            `Installing current project as a global npm tool... (via ${cmd})`
        );

        const { code } = shell.exec(cmd);
        if (code !== 0) {
            _echoInstallErrorAndExit(code);
            return;
        }

        echo.success("Current project was successfully installed globally");
        echo.message(
            `You should now be able to run it from any directory with: ${purple(
                `${binName} <command>`
            )}`
        );
        echo.newLine();
    };

    const _installNpxAlias = () => {
        echo.message(
            `Configuring project-specific '${CLI_NAME}' bash alias...`
        );
        const projectAlias = `alias ${CLI_NAME}='npx ${CLI_NAME}'`;

        if (_bashFileContains(projectAlias)) {
            echo.success(`${CLI_NAME} bash alias already installed`);
            echo.newLine();
            return;
        }

        _writeToBashFile("");
        _writeToBashFile(`# ${CLI_NAME} project-level alias`);
        _writeToBashFile(projectAlias);

        echo.success(`Successfully installed ${CLI_NAME} bash alias`);
        echo.newLine();
    };

    const _writeToBashFile = (text) => shell.echo(text).toEnd(file.bashFile());

    // #endregion Private Functions

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option(s)")
        .description(commands.install.description)
        .parse(process.argv);

    // If no options are passed in, performs installation steps
    if (js.hasNoArguments()) {
        install.run();
    }

    // #endregion Entrypoint
});
