// -----------------------------------------------------------------------------------------
// #region Mocks
// -----------------------------------------------------------------------------------------

jest.mock("find-package-json");

// #endregion Mocks

// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const { BIN, CLI_NAME, PACKAGE_JSON, ENTRYPOINT } = require("./constants");
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
    // #region Setup
    // -----------------------------------------------------------------------------------------

    const mockLocalPackageJson = (value) => {
        finder.mockImplementation(() => {
            return {
                next() {
                    return { value };
                },
            };
        });
    };

    // #endregion Setup

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
        test(`given ${PACKAGE_JSON} cannot be found, it returns the base ${PACKAGE_JSON}`, () => {
            // Arrange
            mockLocalPackageJson(undefined);
            const getBaseSpy = jest.spyOn(packageConfig, "getBase");

            // Act
            const result = packageConfig.getLocal();

            // Assert
            expect(result).toStrictEqual(packageJson);
            expect(getBaseSpy).toHaveBeenCalled();
        });

        test(`given ${PACKAGE_JSON} can be found, it returns the object`, () => {
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

            mockLocalPackageJson(mockPackageJson);

            // Act
            const result = packageConfig.getLocal();

            // Assert
            expect(result).toStrictEqual(mockPackageJson);
        });
    });

    // #endregion getLocal

    // -----------------------------------------------------------------------------------------
    // #region getLocalBinName
    // -----------------------------------------------------------------------------------------

    describe("getLocalBinName", () => {
        test(`given no ${BIN} section exists, it returns undefined`, () => {
            // Arrange
            mockLocalPackageJson({});

            // Act
            const result = packageConfig.getLocalBinName();

            // Assert
            expect(result).toBeUndefined();
        });

        test(`given ${BIN} section contains no keys, it returns undefined`, () => {
            // Arrange
            mockLocalPackageJson({
                [BIN]: {},
            });

            // Act
            const result = packageConfig.getLocalBinName();

            // Assert
            expect(result).toBeUndefined();
        });

        test(`given ${BIN} section contains a single key, it returns the key`, () => {
            // Arrange
            const bin = {
                [CLI_NAME]: ENTRYPOINT,
            };
            const mockPackageJson = {
                [BIN]: bin,
            };
            mockLocalPackageJson(mockPackageJson);
            const expected = Object.keys(bin)[0];

            // Act
            const result = packageConfig.getLocalBinName();

            // Assert
            expect(result).toBe(expected);
        });

        test(`given ${BIN} section contains multiple keys, it returns the first key`, () => {
            // Arrange
            const bin = {
                // Values don't matter, we care about the key
                first: testUtils.randomWord(),
                second: testUtils.randomWord(),
                third: testUtils.randomWord(),
            };
            const mockPackageJson = {
                [BIN]: bin,
            };
            mockLocalPackageJson(mockPackageJson);
            const expected = Object.keys(bin)[0];

            // Act
            const result = packageConfig.getLocalBinName();

            // Assert
            expect(result).toBe(expected);
        });
    });

    // #endregion getLocalBinName

    // -----------------------------------------------------------------------------------------
    // #region getLocalAndCliConfigOrDefault
    // -----------------------------------------------------------------------------------------

    describe("getLocalAndCliConfigOrDefault", () => {
        test(`given no '${CLI_NAME}' section exists, it returns the default config`, () => {
            // Arrange
            mockLocalPackageJson({});

            // Act
            const result = packageConfig.getLocalAndCliConfigOrDefault();

            // Assert
            expect(result).toStrictEqual(packageConfig.DEFAULT_CONFIG);
        });

        describe(`given '${CLI_NAME}' section exists`, () => {
            test(`given no '${ALIASES}' section exists, it returns a default value for the '${ALIASES}' section`, () => {
                // Arrange
                mockLocalPackageJson({
                    [CLI_NAME]: {},
                });

                // Act
                const result = packageConfig.getLocalAndCliConfigOrDefault();

                // Assert
                expect(result.aliases).toStrictEqual(
                    packageConfig.DEFAULT_CONFIG.aliases
                );
            });
        });
    });

    // #endregion getLocalAndCliConfigOrDefault
});

// #endregion Tests
