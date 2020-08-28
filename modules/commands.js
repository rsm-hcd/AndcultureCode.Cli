// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = {
    copy: {
        command: "copy",
        description: "Copy files and/or directories",
    },
    deploy: {
        command: "deploy",
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
        description:
            "Commands for interacting with AndcultureCode github resources",
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
    webpack: {
        command: "webpack",
        description: "Run various webpack commands for the project",
    },
    webpackTest: {
        command: "webpack-test",
        description: "Run various webpack test commands for the project",
    },
};

// #endregion Exports
