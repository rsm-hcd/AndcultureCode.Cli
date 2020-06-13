// -----------------------------------------------------------------------------------------
// #region Mocks
// -----------------------------------------------------------------------------------------

// Mocking the echo module explicitly to suppress extra output from the module.
jest.mock("./echo");
// Mocking the fkill and ps-list modules so that we can modify their behavior for testing.
// They need to be mocked before importing.
jest.mock("fkill");
jest.mock("ps-list");

// #endregion Mocks

// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const faker  = require("faker");
const fkill  = require("fkill");
const ps     = require("./ps");
const psList = require("ps-list");
const shell  = require("shelljs");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("ps", () => {
    let shellExitSpy;
    beforeEach(() => {
        shellExitSpy = jest.spyOn(shell, "exit").mockImplementation();
    });

    // -----------------------------------------------------------------------------------------
    // #region kill
    // -----------------------------------------------------------------------------------------

    describe("kill", () => {
        test("when fkill throws an error, it calls shell.exit", async () => {
            // Arrange
            fkill.mockImplementation(() => { throw new Error(); });

            // Act
            await ps.kill(faker.random.number());

            // Assert
            expect(shellExitSpy).toHaveBeenCalledWith(1);
        });

        test("when fkill succeeds, it returns 0", async () => {
            // Arrange
            fkill.mockImplementation();

            // Act
            const result = await ps.kill(faker.random.number());

            // Assert
            expect(result).toBe(0);
        });
    });

    // #endregion kill

    // -----------------------------------------------------------------------------------------
    // #region list
    // -----------------------------------------------------------------------------------------

    describe("list", () => {
        test("when psList throws an error, it calls shell.exit", async () => {
            // Arrange
            psList.mockImplementation(() => { throw new Error(); });

            // Act
            await ps.list();

            // Assert
            expect(shellExitSpy).toHaveBeenCalledWith(1);
        });

        test("when psList succeeds, it returns an array of processes", async () => {
            // Arrange
            const mockPid       = faker.random.number({ min: 1, max: 100 });
            const mockProcesses = [
                { pid: mockPid },
                { pid: mockPid + 1 },
            ];
            psList.mockImplementation(() => mockProcesses);

            // Act
            const result = await ps.list();

            // Assert
            expect(result).toEqual(mockProcesses);
        });

        test("when given a process name, it returns an array of processes that match", async () => {
            // Arrange
            const mockPid           = faker.random.number({ min: 1, max: 100 });
            const expectedProcess   = {
                name: "dotnet",
                pid:  mockPid
            };
            const unexpectedProcess = {
                name: "paint",
                pid:  mockPid + 1
            };
            const mockProcesses     = [
                expectedProcess,
                unexpectedProcess,
            ];
            psList.mockImplementation(() => mockProcesses);

            // Act
            const result = await ps.list(expectedProcess.name);

            // Assert
            expect(result).toEqual([expectedProcess]);
        });
    });

    // #endregion list
});

// #endregion Tests
