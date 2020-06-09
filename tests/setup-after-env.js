// Explicitly increasing timeout to 15s. After some initial debugging, the default 5s timeout
// was too short for integration testing the parent-level commands.
jest.setTimeout(15000);
