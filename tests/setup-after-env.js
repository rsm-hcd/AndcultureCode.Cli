// Explicitly increasing timeout to 45s. After some initial debugging, the default 5s timeout
// was too short for integration testing the parent-level commands.
jest.setTimeout(45000);
