// -----------------------------------------------------------------------------------------
// #region Mocks
// -----------------------------------------------------------------------------------------

jest.mock("find-package-json");

// #endregion Mocks

// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const { CLI_NAME } = require("./constants");
const packageConfig = require("./package-config");
const packageJson = require("../package.json");
const faker = require("faker");
const finder = require("find-package-json");
const testUtils = require("../tests/test-utils");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const { ALIASES } = packageConfig.SECTIONS;

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("packageConfig", () => {
    // -----------------------------------------------------------------------------------------
    // #region getBase
    // -----------------------------------------------------------------------------------------

    describe("getBase", () => {
        test("it returns the package.json as an object", () => {
            // Arrange & Act
            const result = packageConfig.getBase();

            // Assert
            expect(result).toStrictEqual(packageJson);
        });
    });

    // #endregion getBase

    // -----------------------------------------------------------------------------------------
    // #region getBaseDescription
    // -----------------------------------------------------------------------------------------

    describe("getBaseDescription", () => {
        test("it returns the 'description' property", () => {
            // Arrange & Act
            const result = packageConfig.getBaseDescription();

            // Assert
            expect(result).toBe(packageJson.description);
        });
    });

    // #endregion getBaseDescription

    // -----------------------------------------------------------------------------------------
    // #region getBaseVersion
    // -----------------------------------------------------------------------------------------

    describe("getBaseVersion", () => {
        test("it returns the 'version' property", () => {
            // Arrange & Act
            const result = packageConfig.getBaseVersion();

            // Assert
            expect(result).toBe(packageJson.version);
        });
    });

    // #endregion getBaseVersion

    // -----------------------------------------------------------------------------------------
    // #region getLocal
    // -----------------------------------------------------------------------------------------

    describe("getLocal", () => {
        test("given package.json cannot be found, it returns the base package.json", () => {
            // Arrange
            finder.mockImplementation(() => {
                return {
                    next() {
                        return { value: undefined };
                    },
                };
            });
            const getBaseSpy = jest.spyOn(packageConfig, "getBase");

            // Act
            const result = packageConfig.getLocal();

            // Assert
            expect(result).toStrictEqual(packageJson);
            expect(getBaseSpy).toHaveBeenCalled();
        });

        test("given package.json can be found, it returns the object", () => {
            // Arrange
            const mockPackageJson = {};
            const keyCount = testUtils.randomNumber(1, 10);
            // Note: I think we're doing this somewhere else (generating a random object), might be
            // time to bust out a test utility function.
            for (let i = 0; i < keyCount; i++) {
                const key = faker.random.uuid();
                if (mockPackageJson[key] != null) {
                    return;
                }
                mockPackageJson[key] = testUtils.randomNumber();
            }

            finder.mockImplementation(() => {
                return {
                    next() {
                        return { value: mockPackageJson };
                    },
                };
            });

            const result = packageConfig.getLocal();

            // Assert
            expect(result).toStrictEqual(mockPackageJson);
        });
    });

    // #endregion getLocal

    // -----------------------------------------------------------------------------------------
    // #region getLocalConfigOrDefault
    // -----------------------------------------------------------------------------------------

    describe("getLocalConfigOrDefault", () => {
        test(`given no '${CLI_NAME}' section exists, it returns the default config`, () => {
            // Arrange
            const getLocalSpy = jest
                .spyOn(packageConfig, "getLocal")
                .mockImplementation(() => {
                    return {};
                });

            // Act
            const result = packageConfig.getLocalConfigOrDefault();

            // Assert
            expect(getLocalSpy).toHaveBeenCalled();
            expect(result).toStrictEqual(packageConfig.DEFAULT_CONFIG);
        });

        describe(`given '${CLI_NAME}' section exists`, () => {
            test(`given no '${ALIASES}' section exists, it returns a default value for the '${ALIASES}' section`, () => {
                // Arrange
                const getLocalSpy = jest
                    .spyOn(packageConfig, "getLocal")
                    .mockImplementation(() => {
                        return {
                            [CLI_NAME]: {},
                        };
                    });

                // Act
                const result = packageConfig.getLocalConfigOrDefault();

                // Assert
                expect(getLocalSpy).toHaveBeenCalled();
                expect(result.aliases).toStrictEqual(
                    packageConfig.DEFAULT_CONFIG.aliases
                );
            });
        });
    });

    // #endregion getLocalConfigOrDefault
});

// #endregion Tests
