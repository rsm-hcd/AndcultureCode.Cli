// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const faker = require("faker");
const github = require("./github");
const nock = require("nock");
const testUtils = require("../tests/test-utils");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("github", () => {
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
