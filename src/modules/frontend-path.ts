import upath from "upath";

// -----------------------------------------------------------------------------------------
// #region Functions
// -----------------------------------------------------------------------------------------

const FrontendPath = {
    /**
     * Retrieves the frontend project's folder path
     */
    projectDir() {
        return "frontend";
    },

    /**
     * Retrieves the frontend project's release folder path
     */
    publishDir() {
        return upath.join(this.projectDir(), "build");
    },
};

// #endregion Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { FrontendPath };

// #endregion Exports
