const shell = require("shelljs");


/**
 * Runner method for cli commands. Awaits the 'body' of the command function and calls shell.exit
 * automatically, to prevent any lingering asynchronous work from a module.
 *
 * @param {*} fn Function that contains the command logic.
 */
module.exports.run = async (fn) => {
    await fn();
    shell.exit(0);
}