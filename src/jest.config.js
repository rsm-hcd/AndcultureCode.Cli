// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
    globals: {
        "ts-jest": {
            diagnostics: false,
            tsConfig: "<rootDir>/tsconfig.json",
        },
    },
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: "coverage",
    modulePathIgnorePatterns: ["<rootDir>/dist"],
    preset: "ts-jest",
    restoreMocks: true,
    setupFiles: ["<rootDir>/src/tests/setup.ts"],
    setupFilesAfterEnv: [
        "<rootDir>/src/tests/setup-after-env.ts",
        "jest-extended",
    ],
    testEnvironment: "node",
};
