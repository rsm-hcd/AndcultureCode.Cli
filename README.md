# AndcultureCode.Cli
`and-cli` command-line tool to manage the development of software applications

## Getting Started

```
npm install --global and-cli
```

## Commands

The `and-cli` is built upon our team's best practices for setting up projects.

### dotnet

#### Usage

While the sdk will _eventually_ locate your solution file `.sln`. Placing your solution file in one of the following locations is recommended for the
best performance.

1. Root `*.sln`
2. Child of dotnet folder `dotnet/*.sln`
3. Grandchild of dotnet folder `dotnet/*/*.sln`
4. Anywhere else `**/*.sln`

#### Commands

* `and-cli dotnet` - Manage various aspects of dotnet core builds
* `and-cli dotnet-test` - Run automated tests for dotnet core builds


## Development Setup

* Install NodeJS
* Run `npm install` in the `src` directory
* Add the following alias to your `~/.bash_profile`
    ```
    alias and-cli-dev='node /absolute/path/to/the/AndcultureCode.JavaScript.Sdk/cli.js`
    ```
* Reload the changes `source ~/.bash_profile`
* Now you can run `and-cli-dev` in parallel with any active stable versions installed globally with npm