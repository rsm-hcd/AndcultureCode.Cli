import { WebpackRestoreOptions } from "../interfaces/webpack-restore-options";
import { NodeCI } from "./node-ci";
import { NodeClean } from "./node-clean";
import { NodeRestore } from "./node-restore";
import { WebpackPublish } from "./webpack-publish";

describe("webpack-publish", () => {
    describe("restore", () => {
        beforeEach(() => {
            jest.spyOn(NodeClean, "run").mockImplementation();
            jest.spyOn(NodeClean, "run").mockImplementation();
            jest.spyOn(NodeCI, "run").mockImplementation();
        });
        test("when ci is null, then NodeCI is not called ", () => {
            // Arrange
            const nodeCISpy = jest.spyOn(NodeCI, "run");

            const options: WebpackRestoreOptions = {
                ci: undefined,
                skipClean: undefined,
                skipRestore: undefined,
            };

            // Act

            WebpackPublish.restore(options);

            // Assert
            expect(nodeCISpy).not.toBeCalled();
        });
        test("when ci is false, then NodeCI is not called ", () => {
            // Arrange
            const options: WebpackRestoreOptions = {
                ci: false,
                skipClean: undefined,
                skipRestore: undefined,
            };

            // Act
            const nodeCISpy = jest.spyOn(NodeCI, "run");
            WebpackPublish.restore(options);

            // Assert
            expect(nodeCISpy).not.toBeCalled();
        });
        test("when ci is true, then NodeCI is called ", () => {
            // Arrange
            const options: WebpackRestoreOptions = {
                ci: true,
                skipClean: undefined,
                skipRestore: undefined,
            };

            // Act
            const nodeCISpy = jest.spyOn(NodeCI, "run");
            WebpackPublish.restore(options);

            // Assert
            expect(nodeCISpy).toBeCalled();
        });
        test("when skipClean is false, NodeClean is called", () => {
            // Arrange
            const options: WebpackRestoreOptions = {
                ci: undefined,
                skipClean: false,
                skipRestore: undefined,
            };

            // Act
            const nodeCISpy = jest.spyOn(NodeClean, "run");
            WebpackPublish.restore(options);

            // Assert
            expect(nodeCISpy).toBeCalled();
        });
        test("when skipClean is true, NodeClean is not called", () => {
            // Arrange
            const options: WebpackRestoreOptions = {
                ci: undefined,
                skipClean: true,
                skipRestore: false,
            };

            // Act
            const nodeCISpy = jest.spyOn(NodeClean, "run");
            WebpackPublish.restore(options);

            // Assert
            expect(nodeCISpy).not.toBeCalled();
        });
        test("when skipRestore is false, NodeRestore is called", () => {
            // Arrange
            const options: WebpackRestoreOptions = {
                ci: undefined,
                skipClean: false,
                skipRestore: false,
            };

            // Act
            const nodeCISpy = jest.spyOn(NodeRestore, "run");

            WebpackPublish.restore(options);

            // Assert
            expect(nodeCISpy).toBeCalled();
        });
        test("when skipRestore is true, NodeRestore is not called", () => {
            // Arrange
            const options: WebpackRestoreOptions = {
                ci: undefined,
                skipClean: false,
                skipRestore: true,
            };

            // Act
            const nodeCISpy = jest.spyOn(NodeRestore, "run");
            WebpackPublish.restore(options);

            // Assert
            expect(nodeCISpy).not.toBeCalled();
        });
    });
});
