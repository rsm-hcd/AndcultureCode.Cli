import { AsyncReadlineInterface } from "../interfaces/async-readline-interface";
import { TestUtils } from "../tests/test-utils";
import { Prompt } from "./prompt";

describe("Prompt", () => {
    // -----------------------------------------------------------------------------------------
    // #region Setup
    // -----------------------------------------------------------------------------------------

    let shellExitSpy: jest.SpyInstance;
    let promptInterface: AsyncReadlineInterface;

    beforeEach(() => {
        shellExitSpy = TestUtils.spyOnShellExit();
        promptInterface = Prompt.getInterface();
    });

    const act = async <TReturn>(options: {
        action: Promise<TReturn>;
        input: string;
    }): Promise<TReturn> => {
        const { action, input } = options;
        promptInterface.write(input);
        return action;
    };

    // #endregion Setup

    // -----------------------------------------------------------------------------------------
    // #region Teardown
    // -----------------------------------------------------------------------------------------

    afterEach(() => {
        promptInterface.close();
    });

    // #endregion Teardown

    // -----------------------------------------------------------------------------------------
    // #region confirmOrExit
    // -----------------------------------------------------------------------------------------

    describe("confirmOrExit", () => {
        test("when user responds 'y', it does not call shell.exit", async (done) => {
            // Arrange
            const question = TestUtils.randomWords().join(" ");

            // Act
            await act({
                action: Prompt.confirmOrExit(question),
                input: "y\n",
            });

            // Assert
            expect(shellExitSpy).not.toHaveBeenCalled();
            done();
        });

        test("when user responds 'Y', it does not call shell.exit", async (done) => {
            // Arrange
            const question = TestUtils.randomWords().join(" ");

            // Act
            await act({
                action: Prompt.confirmOrExit(question),
                input: "Y\n",
            });

            // Assert
            expect(shellExitSpy).not.toHaveBeenCalled();
            done();
        });

        test("when user responds without y/Y, it calls shell.exit", async (done) => {
            // Arrange
            const question = TestUtils.randomWords().join(" ");
            // Should never respond with just 'y' or 'Y'
            const response = TestUtils.randomWord().replace(/[yY]/g, "");

            // Act
            await act({
                action: Prompt.confirmOrExit(question),
                input: `${response}\n`,
            });

            // Assert
            expect(shellExitSpy).toHaveBeenCalled();
            done();
        });
    });

    // #endregion confirmOrExit

    // -----------------------------------------------------------------------------------------
    // #region multiline
    // -----------------------------------------------------------------------------------------

    describe("multiline", () => {
        test.todo(
            "TODO - https://github.com/AndcultureCode/AndcultureCode.Cli/issues/165"
        );
    });

    // #endregion multiline
});
