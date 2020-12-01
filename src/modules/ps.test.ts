import faker from "faker";
import { Ps } from "./ps";
import { TestUtils } from "../tests/test-utils";

// -----------------------------------------------------------------------------------------
// #region Mocks
// -----------------------------------------------------------------------------------------

// Mocking the fkill and ps-list modules so that we can modify their behavior for testing.
// They need to be mocked before importing.
jest.mock("fkill");
jest.mock("ps-list");

// #endregion Mocks

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("ps", () => {
    let shellExitSpy: jest.SpyInstance;
    beforeEach(() => {
        shellExitSpy = TestUtils.spyOnShellExit();
    });

    // -----------------------------------------------------------------------------------------
    // #region kill
    // -----------------------------------------------------------------------------------------

    describe("kill", () => {
        test("when fkill throws an error, it calls shell.exit", async () => {
            // Arrange
            jest.requireMock("fkill").mockImplementation(() => {
                throw new Error();
            });

            // Act
            await Ps.kill(faker.random.number());

            // Assert
            expect(shellExitSpy).toHaveBeenCalledWith(1);
        });

        test("when fkill succeeds, it returns 0", async () => {
            // Arrange
            jest.requireMock("fkill").mockImplementation();

            // Act
            const result = await Ps.kill(faker.random.number());

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
            jest.requireMock("ps-list").mockImplementation(() => {
                throw new Error();
            });

            // Act
            await Ps.list();

            // Assert
            expect(shellExitSpy).toHaveBeenCalledWith(1);
        });

        test("when psList succeeds, it returns an array of processes", async () => {
            // Arrange
            const mockPid = faker.random.number({ min: 1, max: 100 });
            const mockProcesses = [{ pid: mockPid }, { pid: mockPid + 1 }];
            jest.requireMock("ps-list").mockImplementation(() => mockProcesses);

            // Act
            const result = await Ps.list();

            // Assert
            expect(result).toEqual(mockProcesses);
        });

        test("when given a process name, it returns an array of processes that match", async () => {
            // Arrange
            const mockPid = faker.random.number({ min: 1, max: 100 });
            const expectedProcess = {
                name: "dotnet",
                pid: mockPid,
            };
            const unexpectedProcess = {
                name: "paint",
                pid: mockPid + 1,
            };
            const mockProcesses = [expectedProcess, unexpectedProcess];
            jest.requireMock("ps-list").mockImplementation(() => mockProcesses);

            // Act
            const result = await Ps.list(expectedProcess.name);

            // Assert
            expect(result).toEqual([expectedProcess]);
        });
    });

    // #endregion list
});

// #endregion Tests
