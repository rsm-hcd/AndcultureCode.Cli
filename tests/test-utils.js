// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const { StringUtils } = require("andculturecode-javascript-core");
const child_process = require("child_process");
const concat = require("concat-stream");
const constants = require("../modules/constants");
const faker = require("faker");
const formatters = require("../modules/formatters");
const path = require("path");
const shell = require("shelljs");
const upath = require("upath");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Mocks
// -----------------------------------------------------------------------------------------

// For most cases, we want to use the manual mock of the child_process module. However,
// in this context, we will be executing the CLI itself, so we need to use the real implementation
// of child_process.
jest.unmock("child_process");

// #endregion Mocks

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

const { ERROR_OUTPUT_STRING } = constants;
const { red } = formatters;

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

const _createNodeProcess = (processPath, args = [], env = null) => {
    args = [processPath].concat(args);

    // Use shelljs to locate the absolute path to our node executable. If it cannot be found,
    // we have bigger issues. Immediately throw an error so the test does not continue.
    const nodePath = shell.which("node");
    if (nodePath == null) {
        _throwFatalError(
            "Could not locate node executable to spawn processes. Check your environment path."
        );
    }

    return child_process.spawn(nodePath.toString(), args, {
        env: Object.assign(
            {
                // Set the HOME directory to the current working directory. This should usually be a temp
                // directory -- see testUtils.createAndUseTmpDir()
                HOME: shell.pwd().toString(),
                NODE_ENV: "test",
                // We need the PATH from the host to execute programs the same way a user would
                PATH: process.env.PATH,
            },
            env
        ),
    });
};

/**
 * Wrapper around the `dotnet` CLI for scaffolding out new solutions/projects.
 *
 * @param {string} type Type of the dotnet project to be created, such as `solution`, `console`, `xunit`, etc.
 * @param {string} [name=""]
 */
const _executeDotnetNew = (type, name = "") => {
    // Base arguments for creating the project
    const args = ["new", type];
    if (StringUtils.hasValue(name)) {
        args.push("--name", name);
    }
    testUtils.executeOrThrow("dotnet", args);
};

/**
 * Wrapper around `child_process.spawn()` that creates a child node process to execute the given
 * process path, returning a promise that can be awaited.
 *
 * @param {string} processPath
 * @param {string[]} args
 * @param {object} opts
 * @returns
 */
const _executeNode = (processPath, args = [], opts = {}) => {
    const { env = null } = opts;
    const childProcess = _createNodeProcess(processPath, args, env);
    childProcess.stdin.setEncoding("utf-8");

    return new Promise((resolve, reject) => {
        childProcess.stderr.once("data", (err) => {
            reject(err.toString());
        });

        childProcess.on("error", reject);

        childProcess.stdout.pipe(
            concat((result) => {
                resolve(result.toString());
            })
        );
    });
};

const _throwFatalError = (message) => {
    throw new Error(`${red(ERROR_OUTPUT_STRING)} ${message}`);
};

// #endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Public Functions
// -----------------------------------------------------------------------------------------

/**
 * The setup of this Node spawn wrapper is heavily based on this article:
 * https://medium.com/@zorrodg/integration-tests-on-node-js-cli-part-1-why-and-how-fa5b1ba552fe
 *
 * It allows for us to call synchronous or asynchronous parent-level commands and test the layer
 * that glues our modules together.
 */
const testUtils = {
    /**
     * Adds one or more dotnet projects to the solution in the current directory based on the given
     * path. Defaults to `"\*\*\/*.csproj"` which will adds all projects in the current directory to the solution.
     *
     * @param {string} [path="."]
     */
    addDotnetProject(path = "**/*.csproj") {
        const matchingPaths = shell.ls(path);
        this.executeOrThrow("dotnet", ["sln", "add", ...matchingPaths]);
    },
    /**
     * Creates and enters a temporary working directory. Returns the directory name as well as
     * a cleanup function for resetting the working directory and removing created dir/files.
     *
     * @param {string} [prefix="tmp"] (Optional) Prefix for the directory name to be generated.
     */
    createAndUseTmpDir(prefix = "") {
        const defaultPrefix = "tmp";
        const oldPwd = shell.pwd().toString();
        const tmpDir = upath.toUnix(
            path.join(
                oldPwd,
                `${defaultPrefix}-${prefix}-${faker.random.uuid()}`
            )
        );

        shell.mkdir("-p", tmpDir);
        shell.cd(tmpDir);

        const cleanupTmpDir = () => {
            shell.cd(oldPwd);
            shell.rm("-rf", tmpDir);
        };

        return { cleanupTmpDir, tmpDir };
    },
    /**
     * Uses the dotnet cli to creates a new dotnet solution in the current directory. If no name is
     * provided, it uses the name of the current directory as the solution name.
     *
     * @param {string} [name=""]
     */
    createDotnetSolution(name = "") {
        _executeDotnetNew("solution", name);
    },
    /**
     * Uses the dotnet cli to creates a new dotnet console app in the current directory. If no name is
     * provided, it uses the name of the current directory as the project name.
     *
     * @param {string} [name=""]
     */
    createDotnetConsoleApp(name = "") {
        _executeDotnetNew("console", name);
    },
    /**
     * Uses the dotnet cli to creates a new XUnit project in the current directory. If no name is
     * provided, it uses the name of the current directory as the project name.
     *
     * @param {string} [name=""]
     */
    createDotnetXUnitProject(name = "") {
        _executeDotnetNew("xunit", name);
    },
    /**
     * Wrapper around `child_process.spawn` that passes in the main executable, `cli.js`, as the process path.
     * This allows you to pass just the command you're testing in as the first argument.
     *
     * @example
     * const result = await testUtils.executeCliCommand("dotnet", ["--help"]);
     * @param {string} command
     * @param {string[]} args
     * @param {object} opts
     */
    executeCliCommand(command = null, args = [], opts = {}) {
        // Generate the absolute path of the main executable file (cli.js) based on the current
        // file's directory.
        const cliEntrypointPath = upath.toUnix(
            path.join(__dirname, "..", "and-cli.js")
        );
        if (command != null) {
            args = [command, ...args];
        }
        return _executeNode(cliEntrypointPath, args, opts);
    },
    /**
     * Calls `child_process.spawnSync()` with the given args or options. If the process fails,
     * it will throw a fatal error to prevent further execution. Useful for arrangement steps
     * that require setting up data for the system under test.
     *
     * @param {string} processPath
     * @param {string[]} [args=[]]
     * @param {object} [opts={}]
     */
    executeOrThrow(processPath, args = [], opts = {}) {
        const { status } = child_process.spawnSync(processPath, args, opts);
        if (status !== 0) {
            _throwFatalError(
                `'${processPath} ${args.join(
                    " "
                )}' failed with exit code: ${status}`
            );
        }
    },

    /**
     * Helper to easily check if tests run in continuous integration environment
     */
    isCI() {
        return process.env["CI"] == "true";
    },

    /**
     * Helper to easily check if tests run outside of continuous integration environment
     */
    isNotCI() {
        return !this.isCI();
    },

    /**
     * Wrapper of faker.random.number
     *
     * @param {number} [min=Number.MIN_VALUE] Minimum number value to randomly generate
     * @param {number} [max=Number.MAX_VALUE] Maximum number value to randomly generate
     */
    randomNumber(min = Number.MIN_VALUE, max = Number.MAX_VALUE) {
        return faker.random.number({ min, max });
    },

    /**
     * Implementation of a random file generating function, since faker.js does not seem to have
     * it yet
     *
     * See https://stackoverflow.com/a/39960706
     * @param {string} extension
     * @returns
     */
    randomFile(extension) {
        if (StringUtils.isEmpty(extension)) {
            extension = faker.system.commonFileExt();
        }

        return `${this.randomPath()}.${extension}`;
    },

    /**
     * Implementation of a random path generating function based on https://stackoverflow.com/a/39960706
     *
     * @param {number} [maxDepth=5] Maximum number of directories deep to generate a path for.
     * @returns A randomly generated path with the platform-specific separator
     */
    randomPath(maxDepth = 5) {
        // Override invalid values for the max depth of the path
        if (maxDepth == null || maxDepth <= 1) {
            maxDepth = 5;
        }

        const words = [];
        for (let i = 0; i < maxDepth; i++) {
            words.push(this.randomWord());
        }
        const randomPath = words.join(path.sep).toLowerCase();
        return path.format({
            base: randomPath,
        });
    },

    /**
     * Wrapper of faker.random.word.
     *
     * Unfortunately there is an unresolved bug https://github.com/Marak/faker.js/issues/661
     * and it will occassionally return multiple which can cause test flake
     */
    randomWord() {
        return faker.random.word().split(" ")[0];
    },

    /**
     * Returns a Jest spy instance of the mocked `shell.exit` method
     */
    spyOnShellExit() {
        const shellMock = jest.requireMock("shelljs");
        return jest.spyOn(shellMock, "exit").mockImplementation();
    },

    /**
     *  Returns a Jest spy instance of the mocked `child_process.spawnSync` method
     *
     * @param {number} status Optional exit status for the mocked method to return. Defaults to 0.
     */
    spyOnSpawnSync(status = 0) {
        const child_processMock = jest.requireMock("child_process");
        return jest
            .spyOn(child_processMock, "spawnSync")
            .mockImplementation(() => {
                return { status };
            });
    },
};

// #endregion Public Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = testUtils;

// #endregion Exports
