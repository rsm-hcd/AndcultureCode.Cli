// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const child_process = require("child_process");
const concat        = require("concat-stream");
const constants     = require("../_modules/constants");
const faker         = require("faker");
const formatters    = require("../_modules/formatters");
const path          = require("path");
const upath         = require("upath");
const shell         = require("shelljs");

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
const { red }                 = formatters;

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
        _throwFatalError("Could not locate node executable to spawn processes. Check your environment path.");
    }

    return child_process.spawn(nodePath.toString(), args, {
        env: Object.assign({
            // Set the HOME directory to the current working directory. This should usually be a temp
            // directory -- see testUtils.createAndUseTmpDir()
            HOME: shell.pwd().toString(),
            NODE_ENV: "test",
            // We need the PATH from the host to execute programs the same way a user would
            PATH: process.env.PATH,
        }, env)
    });
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
     * Creates and enters a temporary working directory. Returns the directory name as well as
     * a cleanup function for resetting the working directory and removing created dir/files.
     *
     * @param {string} [prefix="tmp"] (Optional) Prefix for the directory name to be generated.
     */
    createAndUseTmpDir(prefix = "tmp") {
        const oldPwd = shell.pwd().toString();
        const tmpDir = upath.toUnix(path.join(oldPwd, `${prefix}-${faker.random.uuid()}`));

        shell.mkdir("-p", tmpDir);
        shell.cd(tmpDir);

        const cleanupTmpDir = () => {
            shell.cd(oldPwd);
            shell.rm("-rf", tmpDir);
        };

        return { cleanupTmpDir, tmpDir };
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
    executeCliCommand(command, args = [], opts = {}) {
        // Generate the absolute path of the main executable file (cli.js) based on the current
        // file's directory.
        const cliEntrypointPath = upath.toUnix(path.join(__dirname, "..", "cli.js"));
        return _executeNode(cliEntrypointPath, [command, ...args], opts);
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
            _throwFatalError(`'${processPath} ${args.join(" ")}' failed with exit code: ${status}`);
        }
    },
    verifyDotnetPath() {
        const dotnetPath = shell.which("dotnet");
        if (dotnetPath == null) {
            _throwFatalError("Could not locate dotnet executable. Check your environment path.");
        }

        return dotnetPath;
    }
};

// #endregion Public Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

module.exports = testUtils;

// #endregion Exports