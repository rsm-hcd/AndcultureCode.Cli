#!/usr/bin/env node

require("./command-runner").run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Imports
    // -----------------------------------------------------------------------------------------

    const { StringUtils } = require("andculturecode-javascript-core");
    const commandStringFactory = require("./utilities/command-string-factory");
    const echo = require("./modules/echo");
    const file = require("./modules/file");
    const jenkins = require("./modules/jenkins");
    const js = require("./modules/js");
    const optionStringFactory = require("./utilities/option-string-factory");
    const program = require("commander");
    const prompt = require("./modules/user-prompt");
    const shell = require("shelljs");

    // #endregion Imports

    // -----------------------------------------------------------------------------------------
    // #region Constants
    // -----------------------------------------------------------------------------------------

    const INIT_OPTION = optionStringFactory.build("init", "i");
    const PROFILE_OPTION = optionStringFactory.build("profile <p>", "p");
    const CREATE_PROFILE_OPTION = optionStringFactory.build("new");

    // #endregion Constants

    // -----------------------------------------------------------------------------------------
    // #region Variables
    // -----------------------------------------------------------------------------------------

    let tag = null;
    let job = null;

    // #endregion Variables

    // -----------------------------------------------------------------------------------------
    // #region Functions
    // -----------------------------------------------------------------------------------------

    const jenkinsDeploy = {
        async build() {
            const userPrompt = prompt.getPrompt();
            let profile = program.profile;
            if (StringUtils.isEmpty(program.profile)) {
                echo.error("Please specify a profile [--profile] to trigger");
                shell.exit(1);
            }
            const config = jenkins.getConfig();
            if (config.profiles[profile] == null) {
                echo.error(
                    "Profile not found, please check your configuration"
                );
                shell.exit(1);
            }

            job = config.profiles[profile];
            tag = await userPrompt.questionAsync("Tag name to deploy: ");
            this.validateOrExit();

            await prompt.confirmOrExit(
                `Please confirm deployment of tag ${tag} to ${job}`
            );

            echo.message(`Jenkins starting ${job}, deploying version ${tag}`);
            const url = `${config.url}/job/${job}/buildWithParameters?version=${tag}`;

            const cmd = commandStringFactory.build(
                "curl",
                "-X",
                "POST",
                "-L",
                `--user ${config.username}:${config.token}`,
                url
            );

            if (shell.exec(cmd).code !== 0) {
                echo.error(" - Failed to deploy jenkins");
                shell.exit(1);
            }
        },
        async createProfile() {
            const userPrompt = prompt.getPrompt();
            const jenkinsJobName = await userPrompt.questionAsync(
                "Jenkins Job Name: "
            );
            const profileName = await userPrompt.questionAsync(
                "Profile name (Nickname): "
            );

            let config = jenkins.getConfig();
            let profiles = config.profiles;

            if (profiles == null) {
                profiles = Object.create(null);
            }
            profiles[profileName] = jenkinsJobName;
            config.profiles = profiles;

            jenkins.writeToConfig(config);
        },
        async init() {
            const configPath = jenkins.getConfigPath();
            const userPrompt = prompt.getPrompt();

            await prompt.confirmOrExit(
                "This operation will overwrite any existing configurations. Continue?"
            );

            file.deleteIfExists(configPath);
            shell.touch(configPath);

            const url = await userPrompt.questionAsync("Jenkins server url: ");
            const username = await userPrompt.questionAsync(
                "Jenkins Username: "
            );
            const token = await userPrompt.questionAsync("Jenkins API Token: ");

            let config = jenkins.getConfig();
            config = Object.assign(config, { url, username, token });

            const configResult = jenkins.writeToConfig(config);
            if (!configResult) {
                echo.error("Error writing to config file");
                shell.exit(1);
            }
            await prompt.confirmOrExit("Success, add job profile?");
            await this.createProfile();
        },
        async run() {
            if (program.init) {
                await this.init();
                return;
            }
            if (program.new) {
                await this.createProfile();
                return;
            }
            await this.build();
        },
        validateOrExit() {
            const errors = [];
            const config = jenkins.getConfig();
            if (
                StringUtils.isEmpty(config.url) ||
                StringUtils.isEmpty(config.username) ||
                StringUtils.isEmpty(config.token)
            ) {
                errors.push("Credentials not found");
            }
            if (StringUtils.isEmpty(job)) {
                errors.push("job is required");
            }

            if (StringUtils.isEmpty(tag)) {
                errors.push("tag is required");
            }

            if (errors.length > 0) {
                echo.errors(errors);
                shell.exit(1);
            }
            return true;
        },
    };

    // #endregion Functions

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .description("Trigger a build through Jenkins remotely")
        .option(CREATE_PROFILE_OPTION, "Configure a profile for a jenkins job")
        .option(INIT_OPTION, "Configure Jenkins credentials")
        .option(PROFILE_OPTION, "Profile selected to trigger")
        .parse(process.argv);

    // #endregion Entrypoint

    if (js.hasNoArguments()) {
        program.help();
    }

    await jenkinsDeploy.run();
});
