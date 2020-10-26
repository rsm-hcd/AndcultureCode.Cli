#!/usr/bin/env node

const { profile } = require("console");

require("./command-runner").run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Imports
    // -----------------------------------------------------------------------------------------

    const {
        StringUtils,
        CollectionUtils,
    } = require("andculturecode-javascript-core");
    const commandStringFactory = require("./utilities/command-string-factory");
    const echo = require("./modules/echo");
    const file = require("./modules/file");
    const optionStringFactory = require("./utilities/option-string-factory");
    const program = require("commander");
    const prompt = require("./modules/user-prompt");
    const path = require("path");
    const shell = require("shelljs");
    const upath = require("upath");
    const os = require("os");
    const readline = require("readline");
    const fs = require("fs");

    // #endregion Imports

    // -----------------------------------------------------------------------------------------
    // #region Constants
    // -----------------------------------------------------------------------------------------

    const INIT_OPTION = optionStringFactory.build("init", "i");
    const PROFILE_OPTION = optionStringFactory.build("profile <p>", "p");
    const CREATE_PROFILE_OPTION = optionStringFactory.build("new");
    const CONFIG_FILE = ".jenkinsconfig";

    // #endregion Constants

    // -----------------------------------------------------------------------------------------
    // #region Variables
    // -----------------------------------------------------------------------------------------

    let tag = null;
    let job = null;
    let username = null;
    let token = null;
    let jenkinsUrl = null;
    let profile = null;

    // #endregion Variables

    // -----------------------------------------------------------------------------------------
    // #region Functions
    // -----------------------------------------------------------------------------------------

    const jenkinsDeploy = {
        async init() {
            // create .jenkinsconfig file
            const configPath = this.getConfigPath();
            file.deleteIfExists(configPath);
            shell.touch(configPath);
            // prompt user for credentials
            const userPrompt = prompt.getPrompt();
            jenkinsUrl = await userPrompt.questionAsync("Jenkins server url: ");
            username = await userPrompt.questionAsync("Jenkins Username: ");
            token = await userPrompt.questionAsync("Jenkins API Token: ");

            const baseConfig = {
                url: jenkinsUrl,
                credentials: {
                    username: username,
                    token: token,
                },
                profiles: {},
            };
            this.writeToConfig(JSON.stringify(baseConfig));
            await prompt.confirmOrExit("Success, add job profile?", 0);
            await this.createProfile();
        },

        async createProfile() {
            const userPrompt = prompt.getPrompt();
            const jenkinsJobName = await userPrompt.questionAsync(
                "Jenkins Job Name: "
            );
            const profileName = await userPrompt.questionAsync(
                "Profile name (Name to use in cli): "
            );

            let config = this.getConfig();
            let profiles = config.profiles;
            if (profiles === null || profiles === undefined) {
                profiles = Object.create(null);
            }
            profiles[profileName] = jenkinsJobName;
            config.profiles = profiles;
            this.writeToConfig(JSON.stringify(config));
            shell.exit(0);
        },

        getConfig() {
            const configPath = this.getConfigPath();
            const configFile = fs.readFileSync(configPath);
            return JSON.parse(configFile);
        },

        writeToConfig(value) {
            const configPath = this.getConfigPath();
            fs.writeFileSync(configPath, value);
        },

        getConfigPath() {
            const homeDir = os.homedir();
            return (configPath = upath.toUnix(path.join(homeDir, CONFIG_FILE)));
        },

        async build() {
            const userPrompt = prompt.getPrompt();
            const config = this.getConfig();
            let profile = program.profile;
            if (StringUtils.isEmpty(program.profile)) {
                echo.error("Please specify a profile [--profile] to trigger");
                shell.exit(1);
            }
            job = config.profiles[profile];
            tag = await userPrompt.questionAsync("Tag name to deploy: ");
            this.validateOrExit();

            await prompt.confirmOrExit(
                `Please confirm deployment of tag ${tag} to ${job}`,
                0
            );
            echo.message(`Jenkins starting ${job}, deploying version ${tag}`);
            const url = `${jenkinsUrl}/job/${job}/buildWithParameters?version=${tag}`;

            const cmd = commandStringFactory.build(
                "curl",
                "-X",
                "POST",
                "-L",
                `--user ${config.credentials.username}:${config.credentials.token}`,
                url
            );
            if (shell.exec(cmd, { silent: false }).code !== 0) {
                echo.error(" - Failed to deploy jenkins");
                shell.exit(1);
            }
        },

        async run() {
            if (program.init) {
                await this.init();
            }
            if (program.new) {
                await this.createProfile();
            }
            await this.build();
        },
        validateOrExit() {
            const errors = [];
            const config = this.getConfig();
            if (
                StringUtils.isEmpty(config.url) ||
                StringUtils.isEmpty(config.credentials.username) ||
                StringUtils.isEmpty(config.credentials.token)
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
        .option(CREATE_PROFILE_OPTION, "Profile selected to trigger")
        .option(INIT_OPTION, "Configure Jenkins credentials")
        .option(PROFILE_OPTION, "Profile selected to trigger")
        .parse(process.argv);
    // #endregion Entrypoint

    await jenkinsDeploy.run();
});
