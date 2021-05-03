import { TestUtils } from "../tests/test-utils";
import { File } from "./file";

describe("File", () => {
    // -----------------------------------------------------------------------------------------
    // #region exists
    // -----------------------------------------------------------------------------------------

    describe("exists", () => {
        test("given no file matching expression exists, returns false", () => {
            // Arrange
            const fileFirstSpy = jest
                .spyOn(File, "first")
                .mockReturnValue(undefined as any);
            const fileExpression = TestUtils.randomPath();

            // Act
            const result = File.exists(fileExpression);

            // Assert
            expect(result).toBeFalse();
            expect(fileFirstSpy).toHaveBeenCalled();
        });

        test("given file matching expression exists, returns true", () => {
            // Arrange
            const fileExpression = TestUtils.randomPath();
            const fileFirstSpy = jest
                .spyOn(File, "first")
                .mockReturnValue(fileExpression);

            // Act
            const result = File.exists(fileExpression);

            // Assert
            expect(result).toBeTrue();
            expect(fileFirstSpy).toHaveBeenCalled();
        });
    });

    // #endregion exists
});
