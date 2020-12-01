import { DotnetKill } from "./dotnet-kill";
import faker from "faker";
import { Ps } from "./ps";
import { TestUtils } from "../tests/test-utils";
import { ProcessDescriptor } from "ps-list";

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("DotnetKill", () => {
    // -----------------------------------------------------------------------------------------
    // #region run
    // -----------------------------------------------------------------------------------------

    describe("run", () => {
        let shellExitSpy: jest.SpyInstance;
        beforeEach(() => {
            shellExitSpy = TestUtils.spyOnShellExit();
        });

        test(`when '${DotnetKill.cmd()}' fails, it calls shell.exit`, async () => {
            // Arrange
            const exitCode = faker.random.number({ min: 1 });
            const spawnSyncSpy = TestUtils.spyOnSpawnSync(exitCode);

            // Act
            await DotnetKill.run();

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalled();
            expect(shellExitSpy).toHaveBeenCalledWith(exitCode);
        });

        test("when no dotnet process ids are found, it returns true", async () => {
            // Arrange
            const psListSpy = jest.spyOn(Ps, "list").mockResolvedValue([]);

            // Act
            const result = await DotnetKill.run();

            // Assert
            expect(psListSpy).toHaveBeenCalled();
            expect(result).toBeTrue();
        });

        test("when dotnet process ids are found, it calls ps.kill", async () => {
            // Arrange
            const mockPid = faker.random.number({ min: 1, max: 100 });
            const mockProcesses: ProcessDescriptor[] = [
                {
                    name: TestUtils.randomWord(),
                    pid: mockPid,
                    ppid: 0,
                },
                { name: TestUtils.randomWord(), pid: mockPid + 1, ppid: 0 },
            ];
            const psKillSpy = jest.spyOn(Ps, "kill").mockResolvedValue(0);
            jest.spyOn(Ps, "list").mockResolvedValue(mockProcesses);

            // Act
            await DotnetKill.run();

            // Assert
            expect(psKillSpy).toHaveBeenCalledWith(
                mockProcesses.map((e) => e.pid)
            );
        });
    });

    // #endregion run
});

// #endregion Tests
