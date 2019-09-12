/**************************************************************************************************
 * Imports
 **************************************************************************************************/

const archiver = require("archiver");
const echo     = require("./echo");
const fs       = require("fs");


/**************************************************************************************************
 * Functions
 **************************************************************************************************/

const zip = {

    /**
     * File source and destination descriptor
     * @typedef {Object} InputFile
     * @property {string} source - Relative or absolute path to file
     * @property {string} [destination] - Relative path to file within output zip. If not supplied, source is used.
     */

    /**
     * Creates a new zip archive comprised of the supplied file(s) and/ or director(ies)
     * @param {string[]} inputDirectories - Relative or absolute path to directories
     * @param {InputFile[]} inputFiles - Files to include in the zip
     * @param {string} outputPath - Relative or absolute file path of final zip archive
     */
    create(inputDirectories, inputFiles, outputPath) {
        return new Promise((resolve, reject) => {
            echo.message(`Creating zip '${outputPath}'...`);

            if (inputDirectories === undefined || inputDirectories === null) {
                inputDirectories = [];
            }

            if (inputFiles === undefined || inputFiles === null) {
                inputFiles = [];
            }

            const archive         = archiver("zip");
            const output          = fs.createWriteStream(outputPath);
            const rejectWithError = (error) => {
                echo.error(` - Failed creating zip - ${error}`);
                reject(error);
            };

            output.on("close", () => {
                echo.success(` - Finished creating zip '${outputPath}' -- ${archive.pointer()} total bytes`);
                resolve();
            });

            archive.on("warning", (err) => {
                if (err.code === "ENOENT") { return; }
                rejectWithError(err);
            });

            // good practice to catch this error explicitly
            archive.on("error", (err) => rejectWithError(err));

            archive.pipe(output);

            // add directories
            inputDirectories.forEach((inputDirectory) => archive.directory(inputDirectory, false));

            // add files
            inputFiles.forEach((inputFile) => {
                const destination = inputFile.destination ? inputFile.destination : inputFile.source;
                archive.file(inputFile.source, { name: destination });
            });

            archive.finalize();
        });
    },
};


 /**************************************************************************************************
 * Exports
 **************************************************************************************************/

module.exports = zip;