# AndcultureCode.Cli
`and-cli` command-line tool to manage the development of software applications.

## Getting started

All-the-things (global npm package, project alias and developer alias).
```
./cli.js install
```
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
The documentation for `and-cli` can be found in [COMMANDS.md](./COMMANDS.md).


## Troubleshooting

### Value for command arguments are out of order
Depending upon the shell/terminal you are using, the node process sometimes requires the `--` delimiter between the command and the arguments. Otherwise, especially in a shell like windows command prompt, the value for arguments gets piped out of order.

Example:
* Before: `and-cli dotnet --cli "test db migrate"`
    * Works in most shells, but requires the arguments to be in quotes. Fails in windows command prompt
* After: `and-cli dotnet -- --cli test db migrate`
    * Portable and doesn't require quotes
