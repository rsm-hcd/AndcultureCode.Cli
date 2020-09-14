# AndcultureCode.Cli

[![Build Status](https://travis-ci.org/AndcultureCode/AndcultureCode.Cli.svg?branch=master)](https://travis-ci.org/AndcultureCode/AndcultureCode.Cli)
[![codecov](https://codecov.io/gh/AndcultureCode/AndcultureCode.Cli/branch/master/graph/badge.svg)](https://codecov.io/gh/AndcultureCode/AndcultureCode.Cli)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

`and-cli` command-line tool to manage the development of software applications.

## Getting started

From the root of the cloned or forked repository, run this command:

```
npm install && ./and-cli.js install
```

What this does:

1. Installs a global version of the npm package
2. Creates an alias `and-cli` for the installed version of the npm package in your project, which defaults to globally installed package if not installed for project
3. Creates an alias `and-cli-dev` for the running the cli while developing for it, via the directory in which you cloned or forked the repository

To install `and-cli` only for the current project, run this in its root directory:

```
# npm
npm install --save-dev and-cli

# yarn
yarn add and-cli --dev
```

To install the CLI globally, do:

```
# npm
npm install and-cli -g

# yarn
yarn global add and-cli
```

The documentation for `and-cli` commands can be found in [COMMANDS.md](./COMMANDS.md).

## Project structure

```
.
├── __mocks__/                              # Mocked module implementations for Jest
│   ...
│   └── shelljs.js
├── modules/                                # Modules are shared functions holding business logic to be imported & called by commands
│   ...
│   ├── command-registry.js                 # Module holding abstractions around command registration (internal & external)
│   ├── command-registry.test.js            # Unit test file for the command-registry module
│   ├── commands.js                         # Module exporting names & descriptions of each command to be registered for the CLI
|   ...
│   └── zip.js
├── tests/                                  # Setup, utilities and shared specs for the test suite
|   ...
│   └── test-utils.js
├── types/                                  # Custom types found in the project. Not currently on TS, but this will ease the migration
|   ...
│   └── option-string-type.js
├── utilities/                              # Utility functions that aren't really categorized as a standard 'module'
|   ...
|   ├── option-string-factory.js            # Factory for building out option strings to be passed to `program.option`, ie `-i, --info`
|   └── option-string-factory.test.js       # Unit tests file for the option-string-factory utility
├── and-cli.js                              # Main entrypoint/parent command that registers subcommands
├── and-cli-copy.js                         # Implementation of the 'copy' command
├── and-cli-copy.test.js                    # Integration test file for the 'copy' command
| ...
├── and-cli.test.js                         # Integration test file for the main entrypoint/parent command
├── COMMANDS.md                             # Markdown file containing extra documentation for each command
├── command-runner.js                       # Utility module for wrapping command body functions in to mimic top-level async
├── package.json
└── package-lock.json

```

## Testing strategy

For testing, we use [`Jest`](https://github.com/facebook/jest). We integration test top-level commands (such as `and-cli-dotnet`) and unit test shared modules/utilities (such as `modules/dotnet-build` or `utilities/option-string-factory`).

While we do not have any coverage thresholds currently configured, we ask that new modules/utilities introduced to the codebase are unit tested for high-value paths. Integration tests should be considered, but written more sparingly due to the overhead of run-time.

## Extending functionality

The functionality of this CLI can be extended by adding it as a dependency in your node project and requiring the main module, ie `require("and-cli")`. All commands should be registered through the `command-registry` module, which provides multiple functions for adding, overriding, and removing commands.

A small example of a project that imports this package and pulls in all of the base commands:

```JS
#!/usr/bin/env node

// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const commandRegistry = require("and-cli/modules/command-registry");
const program = require("and-cli");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Entrypoint
// -----------------------------------------------------------------------------------------

// Register all of the base commands from the and-cli with this application
commandRegistry.registerBaseCommands();

program.parse(process.argv);

// #endregion Entrypoint
```

For more examples, or to see what the full project structure might look like, see this example repository:

[`AndcultureCode.Cli.PluginExample`](https://github.com/AndcultureCode/AndcultureCode.Cli.PluginExample)

## Troubleshooting

### Leading slash auto-converted to absolute path

Due to POSIX auto path conversion if you have an argument that needs to start with a leading slash "/". Escape it with an additional slash "//".

Upon application startup the CLI will replace it with the single slash "/".

### Value for command arguments are out of order

Depending upon the shell/terminal you are using, the node process sometimes requires the `--` delimiter between the command and the arguments. Otherwise, especially in a shell like windows command prompt, the value for arguments gets piped out of order.

Example:

-   Before: `and-cli dotnet --cli "test db migrate"`
    -   Works in most shells, but requires the arguments to be in quotes. Fails in windows command prompt
-   After: `and-cli dotnet -- --cli test db migrate`
    -   Portable and doesn't require quotes

### Command listed in documentation is not found or functioning as expected

If you are using the project alias, check to make sure the version in your `package.json` is up to date. You can ensure the latest is installed by running:

```
npm install --save-dev and-cli@latest
```

If you don't have the package installed in your project and you're using a global package, you can check the current version with:

```
npm list -g --depth=0 | grep and-cli
```

The latest version can be installed by running:

```
npm install --global and-cli@latest
```
