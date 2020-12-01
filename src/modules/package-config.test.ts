import { Constants } from "./constants";
import { PackageConfig } from "./package-config";
import { TestUtils } from "../tests/test-utils";
import packageJson from "../../package.json";

// -----------------------------------------------------------------------------------------
// #region Mocks
// -----------------------------------------------------------------------------------------

jest.mock("find-package-json");

// #endregion Mocks

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const { ALIASES } = PackageConfig.SECTIONS;
const { BIN, CLI_NAME, ENTRYPOINT, PACKAGE_JSON } = Constants;

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("PackageConfig", () => {
    // -----------------------------------------------------------------------------------------
    // #region Setup
    // -----------------------------------------------------------------------------------------

    const mockLocalPackageJson = (value: any) => {
        jest.requireMock("find-package-json").mockImplementation(() => {
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
            const result = PackageConfig.getBase();

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
            const result = PackageConfig.getBaseDescription();

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
            const result = PackageConfig.getBaseVersion();

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
            const getBaseSpy = jest.spyOn(PackageConfig, "getBase");

            // Act
            const result = PackageConfig.getLocal();

            // Assert
            expect(result).toStrictEqual(packageJson);
            expect(getBaseSpy).toHaveBeenCalled();
        });

        test(`given ${PACKAGE_JSON} can be found, it returns the object`, () => {
            // Arrange
            const mockPackageJson = TestUtils.randomObject();
            mockLocalPackageJson(mockPackageJson);

            // Act
            const result = PackageConfig.getLocal();

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
            const result = PackageConfig.getLocalBinName();

            // Assert
            expect(result).toBeUndefined();
        });

        test(`given ${BIN} section contains no keys, it returns undefined`, () => {
            // Arrange
            mockLocalPackageJson({
                [BIN]: {},
            });

            // Act
            const result = PackageConfig.getLocalBinName();

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
            const result = PackageConfig.getLocalBinName();

            // Assert
            expect(result).toBe(expected);
        });

        test(`given ${BIN} section contains multiple keys, it returns the first key`, () => {
            // Arrange
            const bin = {
                // Values don't matter, we care about the key
                first: TestUtils.randomWord(),
                second: TestUtils.randomWord(),
                third: TestUtils.randomWord(),
            };
            const mockPackageJson = {
                [BIN]: bin,
            };
            mockLocalPackageJson(mockPackageJson);
            const expected = Object.keys(bin)[0];

            // Act
            const result = PackageConfig.getLocalBinName();

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
            const result = PackageConfig.getLocalAndCliConfigOrDefault();

            // Assert
            expect(result).toStrictEqual(PackageConfig.DEFAULT_CONFIG);
        });

        describe(`given '${CLI_NAME}' section exists`, () => {
            test(`given no '${ALIASES}' section exists, it returns a default value for the '${ALIASES}' section`, () => {
                // Arrange
                mockLocalPackageJson({
                    [CLI_NAME]: {},
                });

                // Act
                const result = PackageConfig.getLocalAndCliConfigOrDefault();

                // Assert
                expect(result.aliases).toStrictEqual(
                    PackageConfig.DEFAULT_CONFIG.aliases
                );
            });
        });
    });

    // #endregion getLocalAndCliConfigOrDefault
});

// #endregion Tests
