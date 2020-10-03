// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const faker = require("faker");
const file = require("./file");
const fs = require("fs");
const github = require("./github");
const nock = require("nock");
const testUtils = require("../tests/test-utils");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("github", () => {
    // -----------------------------------------------------------------------------------------
    // #region configureToken
    // -----------------------------------------------------------------------------------------

    describe("configureToken", () => {
        let testConfigFilePath = null;

        afterEach(() => {
            if (testConfigFilePath != null) {
                file.deleteIfExists(testConfigFilePath);
                testConfigFilePath = null;
            }
        });

        test("when config does not exist, creates with supplied token", () => {
            // Arrange
            github.configAuthConfigPath = testConfigFilePath = testUtils.randomFile();
            expect(fs.existsSync(testConfigFilePath)).toBeFalse(
                `Expected test config file '${testConfigFilePath}' to not exist`
            );

            const expectedToken = faker.random.uuid();

            // Act
            github.configureToken(expectedToken);

            // Assert
            expect(fs.existsSync(testConfigFilePath)).toBeTrue();

            fs.readFile(testConfigFilePath, "utf8", (err, content) => {
                expect(content).toContain(expectedToken);
            });
        });

        test("when config exists, appends supplied token", () => {
            // Arrange
            github.configAuthConfigPath = testConfigFilePath = testUtils.randomFile();
            expect(fs.existsSync(testConfigFilePath)).toBeFalse(
                `Expected test config file '${testConfigFilePath}' to not exist`
            );

            const expectedExistingContent = faker.random.words(); // <-------- must still contain this content
            fs.writeFileSync(testConfigFilePath, expectedExistingContent, {
                flag: "w",
            });

            const expectedToken = faker.random.uuid();

            // Act
            github.configureToken(expectedToken);

            // Assert
            expect(fs.existsSync(testConfigFilePath)).toBeTrue();

            fs.readFile(testConfigFilePath, "utf8", (err, content) => {
                expect(content).toContain(expectedToken);
                expect(content).toContain(expectedExistingContent);
            });
        });
    });

    // #endregion configureToken

    // -----------------------------------------------------------------------------------------
    // #region description
    // -----------------------------------------------------------------------------------------

    describe("description", () => {
        test("returns non null value", () =>
            expect(github.description()).not.toBeNull());
        test("returns string", () =>
            expect(typeof github.description()).toBe("string"));
        test("returns non-empty string", () =>
            expect(github.description().length).toBeGreaterThan(0));
    });

    //#endregion description

    // -----------------------------------------------------------------------------------------
    // #region getRepo
    // -----------------------------------------------------------------------------------------

    describe("getRepo", () => {
        test("given username does not exist, returns null", async () => {
            // Arrange
            const invalidUser = `AndcultureCode${faker.random.uuid()}`;

            // Act & Assert
            expect(
                await github.getRepo(invalidUser, "AndcultureCode.Cli")
            ).toBeNull();
        });

        test("given repo does not exist, returns null", async () => {
            // Arrange
            const invalidRepo = `AndcultureCode.Cli${faker.random.uuid()}`;

            // Act & Assert
            expect(
                await github.getRepo("AndcultureCode", invalidRepo)
            ).toBeNull();
        });

        test("given username and repo exists, returns repo", async () => {
            // Arrange
            const expectedUsername = "AndcultureCode";
            const expectedRepo = "AndcultureCode.Cli";

            // Act
            const result = await github.getRepo(expectedUsername, expectedRepo);

            // Assert
            expect(result).not.toBeNull();
            expect(result.name).toBe(expectedRepo);
            expect(result.owner.login).toBe(expectedUsername);
        });
    });

    // #endregion getRepo

    // -----------------------------------------------------------------------------------------
    // #region repositories
    // -----------------------------------------------------------------------------------------

    describe("repositories", () => {
        test("given no username, returns null", async () => {
            // Act
            const results = await github.repositories();

            // Assert
            expect(results).toBeNull();
        });

        test("given username, returns list of repositories", async () => {
            // Arrange
            const expected = "wintondeshong";

            nock(github.apiRootUrl)
                .get(
                    new RegExp(
                        expected + "/" + github.apiRepositoriesRouteParam
                    )
                ) // make sure github is properly passed username
                .reply(200, [{ url: `https://someurl.com/${expected}` }]);

            // Act
            const results = await github.repositories(expected);

            // Assert
            expect(results.length).toBeGreaterThan(0);
            results.forEach((r) => expect(r.url).toContain(expected));
        });

        test("given filter, returns list of repositories matched by filter", async () => {
            // Arrange
            const username = "wintondeshong";
            const expected = github.andcultureOrg;
            const unexpected = testUtils.randomWord();

            nock(github.apiRootUrl)
                .get(
                    new RegExp(
                        username + "/" + github.apiRepositoriesRouteParam
                    )
                ) // make sure github is properly passed username
                .reply(200, [{ name: expected }, { name: unexpected }]);

            const filter = (repos) =>
                repos.filter((r) => r.name.startsWith(expected));

            // Act
            const results = await github.repositories(username, filter);

            // Assert
            expect(results.length).toBe(1);
            expect(results[0].name).toBe(expected);
        });
    });

    // #endregion repositories

    // -----------------------------------------------------------------------------------------
    // #region repositoriesByAndculture
    // -----------------------------------------------------------------------------------------

    describe("repositoriesByAndculture", () => {
        test(`given no username, returns list of master ${github.andcultureOrg} repositories`, async () => {
            // Arrange
            const expected = github.andcultureOrg;

            nock(github.apiRootUrl)
                .get(
                    new RegExp(
                        expected + "/" + github.apiRepositoriesRouteParam
                    )
                ) // make sure github is properly passed username
                .reply(200, [{ name: expected }]);

            // Act
            const results = await github.repositoriesByAndculture();

            // Assert
            expect(results.length).toBe(1);
            expect(results[0].name).toBe(expected);
        });

        test(`given username, returns list of ${github.andcultureOrg} repositories`, async () => {
            // Arrange
            const username = "wintondeshong";
            const expected = github.andcultureOrg;
            const unexpected = testUtils.randomWord();

            nock(github.apiRootUrl)
                .get(
                    new RegExp(
                        username + "/" + github.apiRepositoriesRouteParam
                    )
                ) // make sure github is properly passed username
                .reply(200, [{ name: expected }, { name: unexpected }]);

            // Act
            const results = await github.repositoriesByAndculture(username);

            // Assert
            expect(results.length).toBe(1);
            expect(results[0].name).toBe(expected);
        });
    });

    // #endregion repositoriesByAndculture

    // -----------------------------------------------------------------------------------------
    // #region repositoriesByOrganization
    // -----------------------------------------------------------------------------------------

    describe("repositoriesByOrganization", () => {
        test(`given no organization, returns list of master ${github.andcultureOrg} repositories`, async () => {
            // Arrange
            const expected = github.andcultureOrg;

            nock(github.apiRootUrl)
                .get(
                    new RegExp(
                        expected + "/" + github.apiRepositoriesRouteParam
                    )
                ) // make sure github is properly passed username
                .reply(200, [{ name: expected }]);

            // Act
            const results = await github.repositoriesByOrganization();

            // Assert
            expect(results.length).toBe(1);
            expect(results[0].name).toBe(expected);
        });

        test(`given organization, returns list of master ${github.andcultureOrg} repositories`, async () => {
            // Arrange
            const expected = testUtils.randomWord();

            nock(github.apiRootUrl)
                .get(
                    new RegExp(
                        expected + "/" + github.apiRepositoriesRouteParam
                    )
                ) // make sure github is properly passed username
                .reply(200, [{ name: expected }]);

            // Act
            const results = await github.repositoriesByOrganization(expected);

            // Assert
            expect(results.length).toBe(1);
            expect(results[0].name).toBe(expected);
        });

        test(`given filter, returns list of master ${github.andcultureOrg} repositories matched by filter`, async () => {
            // Arrange
            const expected = github.andcultureOrg;
            const unexpected = testUtils.randomWord();

            nock(github.apiRootUrl)
                .get(
                    new RegExp(
                        expected + "/" + github.apiRepositoriesRouteParam
                    )
                ) // make sure github is properly passed username
                .reply(200, [{ name: expected }, { name: unexpected }]);

            const filter = (repos) =>
                repos.filter((r) => r.name.startsWith(expected));

            // Act
            const results = await github.repositoriesByOrganization(
                expected,
                filter
            );

            // Assert
            expect(results.length).toBe(1);
            expect(results[0].name).toBe(expected);
        });
    });

    // #endregion repositoriesByAndculture
});

// #endregion Tests
