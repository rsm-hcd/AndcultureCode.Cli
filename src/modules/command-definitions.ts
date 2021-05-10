import { CommandDefinitions as BaseCommandDefinitions } from "../interfaces/command-definitions";

// -----------------------------------------------------------------------------------------
// #region Public Members
// -----------------------------------------------------------------------------------------

const CommandDefinitions: BaseCommandDefinitions = {
    copy: {
        command: "copy",
        description: "Copy files and/or directories",
    },
    deploy: {
        command: "deploy",
        children: {
            awsBeanstalk: {
                command: "aws-beanstalk",
                description: "Run deployments for AWS Beanstalk",
            },
            awsS3: {
                command: "aws-s3",
                description: "Run deployments for AWS S3",
            },
            azureStorage: {
                command: "azure-storage",
                description: "Run deployments for Azure Storage",
            },
            azureWebApp: {
                command: "azure-web-app",
                description: "Run deployments for Azure Web Apps",
            },
            jenkins: {
                command: "jenkins",
                description: "Run deployments for Jenkins",
            },
        },
        description: "Deploy various application types",
    },
    dotnetTest: {
        command: "dotnet-test",
        description: "Run various dotnet test runner commands for the project",
    },
    dotnet: {
        command: "dotnet",
        description: "Run various dotnet commands for the project",
    },
    github: {
        command: "github",
        children: {
            issue: {
                command: "issue",
                description:
                    "Commands for interacting with AndcultureCode github issues",
            },
            repo: {
                command: "repo",
                description:
                    "Commands for interacting with AndcultureCode github repositories",
            },
            topic: {
                command: "topic",
                description:
                    "Commands for interacting with AndcultureCode github repository topics",
            },
        },
        description:
            "Commands for interacting with AndcultureCode github resources",
    },
    healthCheck: {
        command: "health-check",
        description:
            "Send a web request to a given endpoint on an interval to verify the HTTP response code",
    },
    install: {
        command: "install",
        description:
            "Collection of commands related to installation and configuration of the and-cli",
    },
    migration: {
        command: "migration",
        description: "Run commands to manage Entity Framework migrations",
    },
    nuget: {
        command: "nuget",
        description: "Manages publishing of nuget dotnet core projects",
    },
    restore: {
        command: "restore",
        description:
            "Restores application data assets for various application types",
    },
    webpack: {
        command: "webpack",
        description: "Run various webpack commands for the project",
    },
    webpackTest: {
        command: "webpack-test",
        description: "Run various webpack test commands for the project",
    },
    workspace: {
        command: "workspace",
        description: "Manage AndcultureCode projects workspace",
    },
};

// #endregion Public Members

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { CommandDefinitions };

// #endregion Exports
