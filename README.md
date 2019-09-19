# AndcultureCode.Cli
`and-cli` command-line tool to manage the development of software applications

## Getting Started

All-the-things (global npm package, project alias and developer alias).
```
./cli.js install
```

Global package only
```
npm install --global and-cli
```

Project setup only
```
npm install --save-dev and-cli
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

* `and-cli dotnet` - Runs the dotnet solution's web project
    * `and-cli dotnet -b, --build` - Builds the solution
    * `and-cli dotnet -c, --clean` - Cleans the solution
    * `and-cli dotnet -R, --restore` - Restores NuGet packages for the solution
    * `and-cli dotnet -r, --run` - Runs the dotnet solution's web project (default)
    * `and-cli dotnet -w, --watch` - Runs the solution and reloads on changes
* `and-cli dotnet-test` - Run automated tests for the solution
    * `and-cli dotnet-test --filter <filter>` - Runs automated tests that match the provided filter text

---

### install

The `and-cli` itself requires some minor setup and these commands hopefully ease that lift.

#### Commands

* `and-cli install` - Configures global npm package, project-specific `and-cli` alias and the developer `and-cli-dev` alias

---

### nuget

While the dotnet core cli provides some nuget commands, the process start to finish is less than ideal. These commands aim to make that simple.

#### Commands

* `and-cli nuget --publish <version>` - Updates, packs and publishes dotnet core 'packable' projects to NuGet

---

## Development Setup

* Install NodeJS
* Open shell in root of this repository
* Run `./cli.js install`
* Reload the changes `source ~/.bash_profile && source ~/.bashrc`
* Now you can...
    * Run `and-cli` in the root of any repo with the `and-cli` npm package installed
    * Run `and-cli-dev` in parallel with any active stable versions installed globally with npm