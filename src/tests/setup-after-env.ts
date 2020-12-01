import "jest-extended";
import shell, { ExecOutputReturnValue } from "shelljs";
import child_process from "child_process";
// import psListModule from "ps-list";

// Explicitly increasing timeout to 45s. After some initial debugging, the default 5s timeout
// was too short for integration testing the parent-level commands.
jest.setTimeout(45000);

beforeEach(() => {
    // Typing here is a little restrictive - for our uses, it is always returning this base interface
    // Leaving it in for reference even though we're casting it down to `any`
    jest.spyOn(shell, "exec").mockReturnValue(({
        code: 0,
        stderr: "",
        stdout: "",
    } as ExecOutputReturnValue) as any);
    jest.spyOn(shell, "exit").mockImplementation();
    jest.spyOn(child_process, "spawn").mockImplementation();
    jest.spyOn(child_process, "spawnSync").mockReturnValue({
        output: [],
        pid: 0,
        signal: "SIGTERM",
        status: 0,
        stderr: Buffer.from(""),
        stdout: Buffer.from(""),
    });
});
