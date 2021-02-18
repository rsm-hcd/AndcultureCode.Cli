import { WebpackRestoreOptions } from "../interfaces/webpack-restore-options";
import { NodeCI } from "./node-ci";
import { NodeClean } from "./node-clean";
import { NodeRestore } from "./node-restore";
import { WebpackPublish } from "./webpack-publish";

describe("webpack-publish", () => {
    let nodeCISpy: jest.SpyInstance;
    let nodeCleanSpy: jest.SpyInstance;
    let nodeRestoreSpy: jest.SpyInstance;

    describe("restore", () => {
        beforeEach(() => {
            nodeCISpy = jest.spyOn(NodeCI, "run").mockImplementation();
            nodeCleanSpy = jest.spyOn(NodeClean, "run").mockImplementation();
            nodeRestoreSpy = jest
                .spyOn(NodeRestore, "run")
                .mockImplementation();
        });
        test.each([null, false])(
            "when ci is %p, then NodeCI is not called ",
            () => {
                // Arrange
                const options: WebpackRestoreOptions = {
                    ci: undefined,
                    skipClean: undefined,
                    skipRestore: undefined,
                };

                // Act

                WebpackPublish.restore(options);

                // Assert
                expect(nodeCISpy).not.toBeCalled();
            }
        );
        test("when ci is true, then NodeCI is called ", () => {
            // Arrange
            const options: WebpackRestoreOptions = {
                ci: true,
                skipClean: undefined,
                skipRestore: undefined,
            };

            // Act

            WebpackPublish.restore(options);

            // Assert
            expect(nodeCISpy).toBeCalled();
        });
        test.each([null, false])(
            "when skipClean is %p, then NodeClean is not called ",
            () => {
                // Arrange
                const options: WebpackRestoreOptions = {
                    ci: undefined,
                    skipClean: false,
                    skipRestore: undefined,
                };

                // Act
                WebpackPublish.restore(options);

                // Assert
                expect(nodeCleanSpy).toBeCalled();
            }
        );

        test.each([undefined, null, false])(
            "when skipClean is %p, then NodeRestore is not called ",
            () => {
                // Arrange
                const options: WebpackRestoreOptions = {
                    ci: undefined,
                    skipClean: false,
                    skipRestore: false,
                };

                // Act
                WebpackPublish.restore(options);

                // Assert
                expect(nodeRestoreSpy).toBeCalled();
            }
        );

        test("when skipRestore is true, NodeRestore is not called", () => {
            // Arrange
            const options: WebpackRestoreOptions = {
                ci: undefined,
                skipClean: false,
                skipRestore: true,
            };

            // Act
            WebpackPublish.restore(options);

            // Assert
            expect(nodeRestoreSpy).not.toBeCalled();
        });
    });
});
