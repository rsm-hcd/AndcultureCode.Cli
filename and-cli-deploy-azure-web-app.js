#!/usr/bin/env node
require("./command-runner").run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Imports
    // -----------------------------------------------------------------------------------------

    const azure = require("./_modules/azure");
    const echo = require("./_modules/echo");
    const program = require("commander");
    const shell = require("shelljs");

    // #endregion Imports

    // -----------------------------------------------------------------------------------------
    // #region Variables
    // -----------------------------------------------------------------------------------------

    let appName = null;
    let branch = null;
    let clientId = null;
    let force = false;
    let remote = null;
    let resourceGroup = null;
    let secret = null;
    let tenantId = null;
    let username = null;

    // #endregion Variables

    /// -----------------------------------------------------------------------------------------
    // #region Functions
    // -----------------------------------------------------------------------------------------

    // At some point, these git commands should be put into a shared module, see https://github.com/AndcultureCode/AndcultureCode.Cli/issues/91
    const deployAzureWebApp = {
        createRemoteIfMissing() {
            const checkRemoteExistsCode = shell.exec(
                `git remote get-url ${remote}`
            ).code;

            if (checkRemoteExistsCode === 0) {
                return;
            }

            const url = shell.exec(
                `az webapp deployment list-publishing-credentials --name ${appName} --resource-group ${resourceGroup} --query scmUri --output tsv`
            );

            if (shell.exec(`git remote add ${remote} ${url}`).code !== 0) {
                echo.error("Error trying to add remote!");
                azure.logout();
                shell.exit(1);
            }
        },
        description() {
            return `Pushes indicated branch from the current git repo to indicated Azure Web App git repo, which then deploys to configured Azure Web App environment`;
        },
        pushToRemote() {
            let pushCmd = `git push ${remote} ${branch}:master`;

            if (force) {
                pushCmd += " -f";
            }

            if (shell.exec(pushCmd).code !== 0) {
                echo.error(" - Failed pushing to Web App remote");
                azure.logout();
                shell.exit(1);
            }
        },
        async run() {
            // Check system/command requirements
            this.validateOrExit();

            // Login to Azure
            if (username != null) {
                azure.login(username, secret);
            } else {
                azure.login(clientId, tenantId, secret);
            }

            this.createRemoteIfMissing();

            this.pushToRemote();

            // Logout from Azure
            azure.logout();

            echo.newLine();
            echo.success("Application successfully deployed to Azure Web App!");
        },
        validateOrExit() {
            const errors = [];

            // Validate arguments
            clientId = program.clientId;
            tenantId = program.tenantId;
            username = program.username;

            const missingServicePrincipalArgs =
                clientId == null || tenantId == null;

            if (username == null && missingServicePrincipalArgs) {
                errors.push(
                    "when --client-id or --tenant-id not provided, --username is required"
                );
            }

            secret = program.secret;
            if (secret == null) {
                errors.push("--secret is required");
            }

            appName = program.appName;
            if (appName == null) {
                errors.push("--app-name is required");
            }

            resourceGroup = program.resourceGroup;
            if (resourceGroup == null) {
                errors.push("--resource-group is required");
            }

            branch = program.branch;
            if (branch == null) {
                errors.push("--branch is required");
            }

            remote = program.remote;
            if (remote == null) {
                errors.push("--remote is required");
            }

            // Bail if up-front arguments are errored
            if (errors.length > 0) {
                echo.errors(errors);
                shell.exit(1);
            }

            if (program.force != null) {
                force = true;
            }

            azure.validateAzCli();

            return true;
        },
    };

    // #endregion Functions

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .usage("option")
        .description(deployAzureWebApp.description())
        .option(
            "--app-name <applicationName>",
            "Required name of the Azure Web App"
        )
        .option("--branch <branch>", "Required name of the branch to deploy")
        .option(
            "--client-id <clientID>",
            "Required Client ID (if deploying using Service Principal)"
        )
        .option(
            "--force",
            "Optional flag indicating you want to force push to the git remote"
        )
        .option(
            "--remote <remote>",
            "Required name of the git remote used for Azure Web App deploys (will be created if it does not exist)"
        )
        .option(
            "--resource-group <resourceGroup>",
            "Required name of the resource group to which the Azure Web App belongs"
        )
        .option(
            "--secret <profile>",
            "Required secret for login -- either client secret for service principal or account password"
        )
        .option(
            "--tenant-id <tenantID>",
            "Required Tenant ID (if deploying using Service Principal)"
        )
        .option(
            "--username <username>",
            "Required Azure username (if deploying using Azure credentials)"
        )
        .parse(process.argv);

    await deployAzureWebApp.run();

    // #endregion Entrypoint
});
