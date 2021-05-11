import { CommandDefinition } from "./command-definition";

// -----------------------------------------------------------------------------------------
// #region Interface
// -----------------------------------------------------------------------------------------

/**
 * Strongly typed interface that allows for easier consumption of the `CommandDefinitions` module
 * (for example, `CommandDefinitions.github` is now a known key and you do not need
 * to use the non-null assertion operator ! to access the nullable `.commands` property)
 */
interface CommandDefinitions extends Record<string, CommandDefinition> {
    copy: CommandDefinition;
    deploy: CommandDefinition & {
        children: {
            awsBeanstalk: CommandDefinition;
            awsS3: CommandDefinition;
            azureStorage: CommandDefinition;
            azureWebApp: CommandDefinition;
            jenkins: CommandDefinition;
        };
    };
    dotnetTest: CommandDefinition;
    dotnet: CommandDefinition;
    github: CommandDefinition & {
        children: {
            issue: CommandDefinition;
            repo: CommandDefinition;
            topic: CommandDefinition;
        };
    };
    install: CommandDefinition;
    list: CommandDefinition;
    migration: CommandDefinition;
    nuget: CommandDefinition;
    restore: CommandDefinition & {
        children: {
            azureStorage: CommandDefinition;
        };
    };
    webpack: CommandDefinition;
    webpackTest: CommandDefinition;
    workspace: CommandDefinition;
}

// #endregion Interface

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { CommandDefinitions };

// #endregion Exports
