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
        test.each(["y", "Y"])(
            "when user responds %p, it does not call shell.exit",
            async (response: string) => {
                const question = TestUtils.randomWords().join(" ");
                jest.spyOn(promptInterface, "questionAsync").mockResolvedValue(
                    response
                );

                // Act
                await Prompt.confirmOrExit(question);

                // Assert
                expect(shellExitSpy).not.toHaveBeenCalled();
            }
        );

        test("when user responds without y/Y, it calls shell.exit", async () => {
            // Arrange
            const question = TestUtils.randomWords().join(" ");
            // Should never respond with just 'y' or 'Y'
            const response = TestUtils.randomWord().replace(/[yY]/g, "");
            jest.spyOn(promptInterface, "questionAsync").mockResolvedValue(
                response
            );

            // Act
            await Prompt.confirmOrExit(question);

            // Assert
            expect(shellExitSpy).toHaveBeenCalled();
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
