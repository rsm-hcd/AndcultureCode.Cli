import { Factory } from "rosie";
import { WebpackRestoreOptions } from "../interfaces/webpack-restore-options";
import { FactoryType } from "../tests/factories/factory-type";
import { NodeCI } from "./node-ci";
import { NodeClean } from "./node-clean";
import { NodeRestore } from "./node-restore";
import { WebpackPublish } from "./webpack-publish";

describe("WebpackPublish", () => {
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
        test.each([undefined, null, false])(
            "when ci is %p, then NodeCI is not called ",
            (ci) => {
                // Arrange
                const options = Factory.build<WebpackRestoreOptions>(
                    FactoryType.WebpackRestoreOptions,
                    { ci }
                );

                // Act
                WebpackPublish.restore(options);

                // Assert
                expect(nodeCISpy).not.toBeCalled();
            }
        );
        test("when ci is true, then NodeCI is called ", () => {
            // Arrange
            const options = Factory.build<WebpackRestoreOptions>(
                FactoryType.WebpackRestoreOptions,
                { ci: true }
            );

            // Act
            WebpackPublish.restore(options);

            // Assert
            expect(nodeCISpy).toBeCalled();
        });
        test.each([undefined, null, false])(
            "when skipClean is %p, then NodeClean is not called ",
            (skipClean) => {
                // Arrange
                const options = Factory.build<WebpackRestoreOptions>(
                    FactoryType.WebpackRestoreOptions,
                    { skipClean }
                );

                // Act
                WebpackPublish.restore(options);

                // Assert
                expect(nodeCleanSpy).toBeCalled();
            }
        );
        test("when skipClean is true, NodeClean is not called", () => {
            // Arrange
            const options = Factory.build<WebpackRestoreOptions>(
                FactoryType.WebpackRestoreOptions,
                { skipClean: true }
            );

            // Act
            WebpackPublish.restore(options);

            // Assert
            expect(nodeCleanSpy).not.toBeCalled();
        });

        test.each([undefined, null, false])(
            "when skipRestore is %p, then NodeRestore is not called ",
            (skipRestore) => {
                // Arrange
                const options = Factory.build<WebpackRestoreOptions>(
                    FactoryType.WebpackRestoreOptions,
                    { skipRestore }
                );

                // Act
                WebpackPublish.restore(options);

                // Assert
                expect(nodeRestoreSpy).toBeCalled();
            }
        );

        test("when skipRestore is true, NodeRestore is not called", () => {
            // Arrange
            const options = Factory.build<WebpackRestoreOptions>(
                FactoryType.WebpackRestoreOptions,
                { skipRestore: true }
            );

            // Act
            WebpackPublish.restore(options);

            // Assert
            expect(nodeRestoreSpy).not.toBeCalled();
        });
    });
});
