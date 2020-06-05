// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  automock: false,
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  restoreMocks: true,
  setupFiles: ["./setupTests.js"],
  testEnvironment: "node",
};
