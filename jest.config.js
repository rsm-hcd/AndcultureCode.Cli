// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  automock: true,
  clearMocks: true,
  coverageDirectory: "coverage",
  testEnvironment: "node",
  unmockedModulePathPatterns: [
    "./cli-*",   // Don't mock the commands that we're testing
    "commander", // Throws a TypeError for description() method
    "glob",      // Throws a TypeError for 'inflight' and 'once' package dependencies
  ],
};
