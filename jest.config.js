// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
    automock: false,
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: "coverage",
    restoreMocks: true,
    setupFiles: ["./tests/setup.js"],
    setupFilesAfterEnv: ["./tests/setup-after-env.js", "jest-extended"],
    testEnvironment: "node",
};
