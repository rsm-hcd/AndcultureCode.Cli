// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const echo = require("./echo");
const faker = require("faker");
const file = require("./file");
const fs = require("fs");
const github = require("./github");
const nock = require("nock");
const testUtils = require("../tests/test-utils");
const userPrompt = require("./user-prompt");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("github", () => {
    // -----------------------------------------------------------------------------------------
    // #region Setup
    // -----------------------------------------------------------------------------------------

    /**
     * Utility function for generating the /repos/{owner}/{repoName}/topics API route
     */
    const getRepoTopicsRoute = (owner, repoName) =>
        new RegExp(
            [
                github.apiRepositoriesRouteParam,
                owner,
                repoName,
                github.apiTopicsRouteParam,
            ].join("/")
        );

    afterEach(() => {
        // Clean all mocked API routes - some tests in here actually call the Github API, and will
        // flake out depending on ordering.
        nock.cleanAll();
    });

    // #endregion Setup

    // -----------------------------------------------------------------------------------------
    // #region addTopicToAllRepositories
    // -----------------------------------------------------------------------------------------

    describe("addTopicToAllRepositories", () => {
        test(`it calls addTopicToRepository for each ${github.andcultureOrg} repo`, async () => {
            // Arrange
            const repositories = await github.repositoriesByAndculture();
            const topic = testUtils.randomWord();
            const addTopicSpy = jest
                .spyOn(github, "addTopicToRepository")
                .mockImplementation(() => []);
            // Mock the confirmation prompt since we do not have user input
            jest.spyOn(userPrompt, "confirmOrExit").mockResolvedValueOnce();

            // Act
            await github.addTopicToAllRepositories(topic);

            // Assert
            expect(addTopicSpy).toHaveBeenCalledTimes(repositories.length);
        });
    });

    // #endregion addTopicToAllRepositories

    // -----------------------------------------------------------------------------------------
    // #region addTopicToRepository
    // -----------------------------------------------------------------------------------------

    describe("addTopicToRepository", () => {
        let shellExitSpy;
        beforeEach(() => {
            shellExitSpy = testUtils.spyOnShellExit();
        });

        test.each([undefined, null, "", " "])(
            "given topic is %p, it outputs an error and calls shell.exit",
            async (topic) => {
                // Arrange
                const owner = testUtils.randomWord();
                const repoName = testUtils.randomWord();
                const echoErrorSpy = jest.spyOn(echo, "error");

                // Act
                await github.addTopicToRepository(topic, owner, repoName);

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalled();
            }
        );

        test.each([undefined, null, "", " "])(
            "given owner is %p, it outputs an error and calls shell.exit",
            async (owner) => {
                // Arrange
                const topic = testUtils.randomWord();
                const repoName = testUtils.randomWord();
                const echoErrorSpy = jest.spyOn(echo, "error");

                // Act
                await github.addTopicToRepository(topic, owner, repoName);

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalled();
            }
        );

        test.each([undefined, null, "", " "])(
            "given repoName is %p, it outputs an error and calls shell.exit",
            async (repoName) => {
                // Arrange
                const topic = testUtils.randomWord();
                const owner = testUtils.randomWord();
                const echoErrorSpy = jest.spyOn(echo, "error");

                // Act
                await github.addTopicToRepository(topic, owner, repoName);

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalled();
            }
        );

        describe("given a topic, owner, and repoName", () => {
            test("it calls the topic api and returns the updated topics", async () => {
                // Arrange
                const topic = testUtils.randomWord();
                const owner = testUtils.randomWord();
                const repoName = testUtils.randomWord();
                const existingTopics = [testUtils.randomWord()];
                const expectedTopics = [...existingTopics, topic];

                // We'll want to mock the token so that CI environments aren't left hanging
                jest.spyOn(github, "getToken").mockReturnValue(
                    testUtils.randomWord()
                );

                // Mock the call to get existing topics
                nock(github.apiRootUrl)
                    .get(getRepoTopicsRoute(owner, repoName))
                    .reply(200, { names: existingTopics });

                // Mock the PUT API call to update topics
                nock(github.apiRootUrl)
                    .put(getRepoTopicsRoute(owner, repoName))
                    .reply(200, { names: expectedTopics });

                // Act
                const result = await github.addTopicToRepository(
                    topic,
                    owner,
                    repoName
                );

                // Assert
                expect(result).toContain(topic);
            });
        });
    });

    // #endregion addTopicToRepository

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
        test(`given no username, returns list of main ${github.andcultureOrg} repositories`, async () => {
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
        test(`given no organization, returns list of main ${github.andcultureOrg} repositories`, async () => {
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

        test(`given organization, returns list of main ${github.andcultureOrg} repositories`, async () => {
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

        test(`given filter, returns list of main ${github.andcultureOrg} repositories matched by filter`, async () => {
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

    // -----------------------------------------------------------------------------------------
    // #region removeTopicFromAllRepositories
    // -----------------------------------------------------------------------------------------

    describe("removeTopicFromAllRepositories", () => {
        test(`it calls removeTopicFromRepository for each ${github.andcultureOrg} repo`, async () => {
            // Arrange
            const repositories = await github.repositoriesByAndculture();
            const topic = testUtils.randomWord();
            const removeTopicSpy = jest
                .spyOn(github, "removeTopicFromRepository")
                .mockImplementation(() => []);
            // Mock the confirmation prompt since we do not have user input
            jest.spyOn(userPrompt, "confirmOrExit").mockResolvedValueOnce();

            // Act
            await github.removeTopicFromAllRepositories(topic);

            // Assert
            expect(removeTopicSpy).toHaveBeenCalledTimes(repositories.length);
        });
    });

    // #endregion removeTopicFromAllRepositories

    // -----------------------------------------------------------------------------------------
    // #region removeTopicFromRepository
    // -----------------------------------------------------------------------------------------

    describe("removeTopicFromRepository", () => {
        let shellExitSpy;
        beforeEach(() => {
            shellExitSpy = testUtils.spyOnShellExit();
        });

        test.each([undefined, null, "", " "])(
            "given topic is %p, it outputs an error and calls shell.exit",
            async (topic) => {
                // Arrange
                const owner = testUtils.randomWord();
                const repoName = testUtils.randomWord();
                const echoErrorSpy = jest.spyOn(echo, "error");

                // Act
                await github.removeTopicFromRepository(topic, owner, repoName);

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalled();
            }
        );

        test.each([undefined, null, "", " "])(
            "given owner is %p, it outputs an error and calls shell.exit",
            async (owner) => {
                // Arrange
                const topic = testUtils.randomWord();
                const repoName = testUtils.randomWord();
                const echoErrorSpy = jest.spyOn(echo, "error");

                // Act
                await github.removeTopicFromRepository(topic, owner, repoName);

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalled();
            }
        );

        test.each([undefined, null, "", " "])(
            "given repoName is %p, it outputs an error and calls shell.exit",
            async (repoName) => {
                // Arrange
                const topic = testUtils.randomWord();
                const owner = testUtils.randomWord();
                const echoErrorSpy = jest.spyOn(echo, "error");

                // Act
                await github.removeTopicFromRepository(topic, owner, repoName);

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalled();
            }
        );

        describe("given a topic, owner, and repoName", () => {
            test("it calls the topic api and returns the updated topics", async () => {
                // Arrange
                const topic = testUtils.randomWord();
                const owner = testUtils.randomWord();
                const repoName = testUtils.randomWord();
                const existingTopics = [topic];
                const expectedTopics = [];

                // We'll want to mock the token so that CI environments aren't left hanging
                jest.spyOn(github, "getToken").mockReturnValue(
                    testUtils.randomWord()
                );

                // Mock the call to get existing topics
                nock(github.apiRootUrl)
                    .get(getRepoTopicsRoute(owner, repoName))
                    .reply(200, { names: existingTopics });

                // Mock the PUT API call to update topics
                nock(github.apiRootUrl)
                    .put(getRepoTopicsRoute(owner, repoName))
                    .reply(200, { names: expectedTopics });

                // Act
                const result = await github.removeTopicFromRepository(
                    topic,
                    owner,
                    repoName
                );

                // Assert
                expect(result).not.toContain(topic);
            });
        });
    });

    // #endregion removeTopicFromRepository

    // -----------------------------------------------------------------------------------------
    // #region topicsForRepository
    // -----------------------------------------------------------------------------------------

    describe("topicsForRepository", () => {
        test.each([undefined, null, "", " "])(
            "given owner is %p, it outputs an error and returns undefined",
            async (owner) => {
                // Arrange
                const repoName = testUtils.randomWord();
                const echoErrorSpy = jest.spyOn(echo, "error");

                // Act
                const result = await github.topicsForRepository(
                    owner,
                    repoName
                );

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(result).toBeUndefined();
            }
        );

        test.each([undefined, null, "", " "])(
            "given repoName is %p, it outputs an error and returns undefined",
            async (repoName) => {
                // Arrange
                const owner = testUtils.randomWord();
                const echoErrorSpy = jest.spyOn(echo, "error");

                // Act
                const result = await github.topicsForRepository(
                    owner,
                    repoName
                );

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(result).toBeUndefined();
            }
        );

        describe("given an owner and repoName", () => {
            let owner;
            let repoName;
            let mockRepoTopicsRoute;

            beforeEach(() => {
                owner = testUtils.randomWord();
                repoName = testUtils.randomWord();
                mockRepoTopicsRoute = getRepoTopicsRoute(owner, repoName);
            });

            test("when response is successful, it returns an array of topic names", async () => {
                // Arrange
                const expectedTopics = [
                    testUtils.randomWord(),
                    testUtils.randomWord(),
                ];

                nock(github.apiRootUrl)
                    .get(mockRepoTopicsRoute)
                    .reply(200, { names: expectedTopics });

                // Act
                const result = await github.topicsForRepository(
                    owner,
                    repoName
                );

                // Assert
                expect(result).toStrictEqual(expectedTopics);
            });

            test("when response.data is null, it outputs an error and returns undefined", async () => {
                // Arrange
                const echoErrorSpy = jest.spyOn(echo, "error");
                const responseData = null; // This is the important setup

                nock(github.apiRootUrl)
                    .get(mockRepoTopicsRoute)
                    .reply(200, responseData);

                // Act
                const result = await github.topicsForRepository(
                    owner,
                    repoName
                );

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(result).toBeUndefined();
            });

            test("when response.status < 200, it outputs an error and returns undefined", async () => {
                // Arrange
                const responseStatus = testUtils.randomNumber(0, 199); // This is the important setup
                const responseData = null;
                const echoErrorSpy = jest.spyOn(echo, "error");

                nock(github.apiRootUrl)
                    .get(mockRepoTopicsRoute)
                    .reply(responseStatus, responseData);

                // Act
                const result = await github.topicsForRepository(
                    owner,
                    repoName
                );

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(result).toBeUndefined();
            });

            test("when response.status > 202, it outputs an error and returns undefined", async () => {
                // Arrange
                const responseStatus = testUtils.randomNumber(203); // This is the important setup
                const responseData = null;
                const echoErrorSpy = jest.spyOn(echo, "error");

                nock(github.apiRootUrl)
                    .get(mockRepoTopicsRoute)
                    .reply(responseStatus, responseData);

                // Act
                const result = await github.topicsForRepository(
                    owner,
                    repoName
                );

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(result).toBeUndefined();
            });
        });
    });

    // #endregion topicsForRepository
});

// #endregion Tests
