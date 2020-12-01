import { Echo } from "./echo";
import faker from "faker";
import { File } from "./file";
import fs from "fs";
import { Github } from "./github";
import nock from "nock";
import { TestUtils } from "../tests/test-utils";
import { Prompt } from "./prompt";
import { Repository } from "../interfaces/repository";

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("Github", () => {
    // -----------------------------------------------------------------------------------------
    // #region Setup
    // -----------------------------------------------------------------------------------------

    /**
     * Utility function for generating the /repos/{owner}/{repoName}/pulls API route
     */
    const getRepoPullRequestsRoute = (owner: string, repoName: string) =>
        new RegExp(
            [
                Github.apiRepositoriesRouteParam,
                owner,
                repoName,
                Github.apiPullsRouteParam,
            ].join("/")
        );

    /**
     * Utility function for generating the /repos/{owner}/{repoName}/pulls/{pull_number}/reviews API route
     */
    const getRepoPullRequestReviewsRoute = (
        owner: string,
        repoName: string,
        pullNumber: number
    ) => {
        return new RegExp(
            [
                Github.apiRepositoriesRouteParam,
                owner,
                repoName,
                Github.apiPullsRouteParam,
                pullNumber,
                Github.apiReviewsRouteParam,
            ].join("/")
        );
    };
    /**
     * Utility function for generating the /{owner}/repos API route
     */
    const getReposRoute = (owner: string) =>
        new RegExp(`${owner}/${Github.apiRepositoriesRouteParam}`);

    /**
     * Utility function for generating the /repos/{owner}/{repoName}/topics API route
     */
    const getRepoTopicsRoute = (owner: string, repoName: string) =>
        new RegExp(
            [
                Github.apiRepositoriesRouteParam,
                owner,
                repoName,
                Github.apiTopicsRouteParam,
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
        test(`it calls addTopicToRepository for each ${Github.andcultureOrg} repo`, async () => {
            // Arrange
            const topic = TestUtils.randomWord();
            const repos = [
                { name: "AndcultureCode.Cli" },
                { name: "AndcultureCode.CSharp.Core" },
            ];

            // Mock the API response for repositories
            nock(Github.apiRootUrl)
                .get(getReposRoute(Github.andcultureOrg))
                .reply(200, repos);

            const addTopicSpy = jest
                .spyOn(Github, "addTopicToRepository")
                .mockResolvedValue([]);

            // Mock the confirmation prompt since we do not have user input
            jest.spyOn(Prompt, "confirmOrExit").mockResolvedValueOnce();

            // Act
            await Github.addTopicToAllRepositories(topic);

            // Assert
            expect(addTopicSpy).toHaveBeenCalledTimes(repos.length);
        });
    });

    // #endregion addTopicToAllRepositories

    // -----------------------------------------------------------------------------------------
    // #region addTopicToRepository
    // -----------------------------------------------------------------------------------------

    describe("addTopicToRepository", () => {
        let shellExitSpy: jest.SpyInstance;
        beforeEach(() => {
            shellExitSpy = TestUtils.spyOnShellExit();
        });

        test.each([undefined, null, "", " "])(
            "given topic is %p, it outputs an error and calls shell.exit",
            async (topic) => {
                // Arrange
                const owner = TestUtils.randomWord();
                const repoName = TestUtils.randomWord();
                const echoErrorSpy = jest.spyOn(Echo, "error");

                // Act
                await Github.addTopicToRepository(
                    topic as string,
                    owner,
                    repoName
                );

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalled();
            }
        );

        test.each([undefined, null, "", " "])(
            "given owner is %p, it outputs an error and calls shell.exit",
            async (owner) => {
                // Arrange
                const topic = TestUtils.randomWord();
                const repoName = TestUtils.randomWord();
                const echoErrorSpy = jest.spyOn(Echo, "error");

                // Act
                await Github.addTopicToRepository(
                    topic,
                    owner as string,
                    repoName
                );

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalled();
            }
        );

        test.each([undefined, null, "", " "])(
            "given repoName is %p, it outputs an error and calls shell.exit",
            async (repoName) => {
                // Arrange
                const topic = TestUtils.randomWord();
                const owner = TestUtils.randomWord();
                const echoErrorSpy = jest.spyOn(Echo, "error");

                // Act
                await Github.addTopicToRepository(
                    topic,
                    owner,
                    repoName as string
                );

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalled();
            }
        );

        describe("given a topic, owner, and repoName", () => {
            test("it calls the topic api and returns the updated topics", async () => {
                // Arrange
                const topic = TestUtils.randomWord();
                const owner = TestUtils.randomWord();
                const repoName = TestUtils.randomWord();
                const existingTopics = [TestUtils.randomWord()];
                const expectedTopics = [...existingTopics, topic];

                // We'll want to mock the token so that CI environments aren't left hanging
                jest.spyOn(Github, "getToken").mockResolvedValue(
                    TestUtils.randomWord()
                );

                // Mock the call to get existing topics
                nock(Github.apiRootUrl)
                    .get(getRepoTopicsRoute(owner, repoName))
                    .reply(200, { names: existingTopics });

                // Mock the PUT API call to update topics
                nock(Github.apiRootUrl)
                    .put(getRepoTopicsRoute(owner, repoName))
                    .reply(200, { names: expectedTopics });

                // Act
                const result = await Github.addTopicToRepository(
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
        // -----------------------------------------------------------------------------------------
        // #region Setup
        // -----------------------------------------------------------------------------------------

        const ensureTestFileDoesNotExist = (
            testConfigFilePath: string
        ): void | never => {
            if (!fs.existsSync(testConfigFilePath)) {
                return;
            }

            throw new Error(
                `Expected test config file '${testConfigFilePath}' to not exist`
            );
        };

        // #endregion Setup

        // -----------------------------------------------------------------------------------------
        // #region Teardown
        // -----------------------------------------------------------------------------------------

        let testConfigFilePath: string | null = null;

        afterEach(() => {
            if (testConfigFilePath != null) {
                File.deleteIfExists(testConfigFilePath);
                testConfigFilePath = null;
            }
        });

        // #endregion Teardown

        test("when config does not exist, creates with supplied token", () => {
            // Arrange
            Github.configAuthConfigPath = testConfigFilePath = TestUtils.randomFilename();
            ensureTestFileDoesNotExist(testConfigFilePath);

            const expectedToken = faker.random.uuid();

            // Act
            Github.configureToken(expectedToken);

            // Assert
            expect(fs.existsSync(testConfigFilePath)).toBeTrue();

            fs.readFile(
                testConfigFilePath,
                { encoding: "utf8" },
                (_: NodeJS.ErrnoException | null, content: string) => {
                    expect(content).toContain(expectedToken);
                }
            );
        });

        test("when config exists, appends supplied token", () => {
            // Arrange
            Github.configAuthConfigPath = testConfigFilePath = TestUtils.randomFilename();
            ensureTestFileDoesNotExist(testConfigFilePath);

            const expectedExistingContent = faker.random.words(); // <-------- must still contain this content
            fs.writeFileSync(testConfigFilePath, expectedExistingContent, {
                flag: "w",
            });

            const expectedToken = faker.random.uuid();

            // Act
            Github.configureToken(expectedToken);

            // Assert
            expect(fs.existsSync(testConfigFilePath)).toBeTrue();

            fs.readFile(
                testConfigFilePath,
                { encoding: "utf8" },
                (_: NodeJS.ErrnoException | null, content: string) => {
                    expect(content).toContain(expectedToken);
                    expect(content).toContain(expectedExistingContent);
                }
            );
        });
    });

    // #endregion configureToken

    // -----------------------------------------------------------------------------------------
    // #region description
    // -----------------------------------------------------------------------------------------

    describe("description", () => {
        test("returns non null value", () =>
            expect(Github.description()).not.toBeNull());
        test("returns string", () =>
            expect(typeof Github.description()).toBe("string"));
        test("returns non-empty string", () =>
            expect(Github.description().length).toBeGreaterThan(0));
    });

    //#endregion description

    // -----------------------------------------------------------------------------------------
    // #region getPullRequests
    // -----------------------------------------------------------------------------------------

    describe("getPullRequests", () => {
        let shellExitSpy: jest.SpyInstance;
        beforeEach(() => {
            shellExitSpy = TestUtils.spyOnShellExit();
        });

        test.each([undefined, null, "", " "])(
            "given owner is %p, it outputs an error and calls shell.exit",
            async (owner) => {
                // Arrange
                const repoName = TestUtils.randomWord();
                const echoErrorSpy = jest.spyOn(Echo, "error");

                // Act
                await Github.getPullRequests(owner as any, repoName);

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalled();
            }
        );

        test.each([undefined, null, "", " "])(
            "given repoName is %p, it outputs an error and calls shell.exit",
            async (repoName) => {
                // Arrange
                const owner = TestUtils.randomWord();
                const echoErrorSpy = jest.spyOn(Echo, "error");

                // Act
                await Github.getPullRequests(owner, repoName as any);

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalled();
            }
        );

        test("given username and repo exists, returns pull requests", async () => {
            // Arrange
            const owner = "AndcultureCode";
            const repoName = "AndcultureCode.Cli";

            const mockedPullRequests = [{ id: TestUtils.randomNumber() }];

            nock(Github.apiRootUrl)
                .get(getRepoPullRequestsRoute(owner, repoName))
                .reply(200, mockedPullRequests);

            // Act
            const results = await Github.getPullRequests(owner, repoName);

            // Assert
            expect(results).not.toBeNil();
            expect(results?.length).toBeGreaterThan(0);
        });
    });

    // #endregion getPullRequests

    // -----------------------------------------------------------------------------------------
    // #region getPullRequestReviews
    // -----------------------------------------------------------------------------------------

    describe("getPullRequestReviews", () => {
        let shellExitSpy: jest.SpyInstance;
        beforeEach(() => {
            shellExitSpy = TestUtils.spyOnShellExit();
        });

        test.each([undefined, null, "", " "])(
            "given owner is %p, it outputs an error and calls shell.exit",
            async (owner) => {
                // Arrange
                const repoName = TestUtils.randomWord();
                const echoErrorSpy = jest.spyOn(Echo, "error");
                const pullNumber = TestUtils.randomNumber();

                // Act
                await Github.getPullRequestReviews(
                    owner as any,
                    repoName,
                    pullNumber
                );

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalled();
            }
        );

        test.each([undefined, null, "", " "])(
            "given repoName is %p, it outputs an error and calls shell.exit",
            async (repoName) => {
                // Arrange
                const owner = TestUtils.randomWord();
                const echoErrorSpy = jest.spyOn(Echo, "error");
                const pullNumber = TestUtils.randomNumber();

                // Act
                await Github.getPullRequestReviews(
                    owner,
                    repoName as any,
                    pullNumber
                );

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalled();
            }
        );

        test("given username and repo exists, returns pull request reviews", async () => {
            // Arrange
            const owner = TestUtils.randomWord();
            const repoName = TestUtils.randomWord();
            const pullNumber = TestUtils.randomNumber();

            const mockedReviews = [{}];

            nock(Github.apiRootUrl)
                .get(
                    getRepoPullRequestReviewsRoute(owner, repoName, pullNumber)
                )
                .reply(200, mockedReviews);

            // Act
            const results = await Github.getPullRequestReviews(
                owner,
                repoName,
                pullNumber
            );

            // Assert
            expect(results).not.toBeNil();
            expect(results?.length).toBeGreaterThan(0);
        });
    });

    // #endregion getPullRequestReviews

    // -----------------------------------------------------------------------------------------
    // #region getRepo
    // -----------------------------------------------------------------------------------------

    describe("getRepo", () => {
        test("given username does not exist, returns null", async () => {
            // Arrange
            const invalidUser = `AndcultureCode${faker.random.uuid()}`;

            // Act & Assert
            expect(
                await Github.getRepo(invalidUser, "AndcultureCode.Cli")
            ).toBeNull();
        });

        test("given repo does not exist, returns null", async () => {
            // Arrange
            const invalidRepo = `AndcultureCode.Cli${faker.random.uuid()}`;

            // Act & Assert
            expect(
                await Github.getRepo("AndcultureCode", invalidRepo)
            ).toBeNull();
        });

        test("given username and repo exists, returns repo", async () => {
            // Arrange
            const expectedUsername = "AndcultureCode";
            const expectedRepo = "AndcultureCode.Cli";

            // Act
            const result = await Github.getRepo(expectedUsername, expectedRepo);

            // Assert
            expect(result).not.toBeNull();
            expect(result!.name).toBe(expectedRepo);
            expect(result!.owner.login).toBe(expectedUsername);
        });
    });

    // #endregion getRepo

    // -----------------------------------------------------------------------------------------
    // #region repositories
    // -----------------------------------------------------------------------------------------

    describe("repositories", () => {
        test("given no username, returns null", async () => {
            // Act
            const results = await Github.repositories();

            // Assert
            expect(results).toBeNil();
        });

        test("given username, returns list of repositories", async () => {
            // Arrange
            const expected = "wintondeshong";

            nock(Github.apiRootUrl)
                .get(getReposRoute(expected)) // make sure Github is properly passed username
                .reply(200, [{ url: `https://someurl.com/${expected}` }]);

            // Act
            const results = await Github.repositories(expected);

            // Assert
            expect(results?.length).toBeGreaterThan(0);
            results?.forEach((r: Repository) =>
                expect(r.url).toContain(expected)
            );
        });

        test("given filter, returns list of repositories matched by filter", async () => {
            // Arrange
            const username = "wintondeshong";
            const expected = Github.andcultureOrg;
            const unexpected = TestUtils.randomWord();

            nock(Github.apiRootUrl)
                .get(getReposRoute(username)) // make sure Github is properly passed username
                .reply(200, [{ name: expected }, { name: unexpected }]);

            const filter = (repos: Repository[]) =>
                repos.filter((r: Repository) => r.name.startsWith(expected));

            // Act
            const results = await Github.repositories(username, filter);

            // Assert
            expect(results).toHaveLength(1);
            expect(results![0].name).toBe(expected);
        });
    });

    // #endregion repositories

    // -----------------------------------------------------------------------------------------
    // #region repositoriesByAndculture
    // -----------------------------------------------------------------------------------------

    describe("repositoriesByAndculture", () => {
        test(`given no username, returns list of main ${Github.andcultureOrg} repositories`, async () => {
            // Arrange
            const expected = Github.andcultureOrg;

            nock(Github.apiRootUrl)
                .get(getReposRoute(expected)) // make sure Github is properly passed username
                .reply(200, [{ name: expected }]);

            // Act
            const results = await Github.repositoriesByAndculture();

            // Assert
            expect(results).toHaveLength(1);
            expect(results![0].name).toBe(expected);
        });

        test(`given username, returns list of ${Github.andcultureOrg} repositories`, async () => {
            // Arrange
            const username = "wintondeshong";
            const expected = Github.andcultureOrg;
            const unexpected = TestUtils.randomWord();

            nock(Github.apiRootUrl)
                .get(getReposRoute(username)) // make sure Github is properly passed username
                .reply(200, [{ name: expected }, { name: unexpected }]);

            // Act
            const results = await Github.repositoriesByAndculture(username);

            // Assert
            expect(results).toHaveLength(1);
            expect(results![0].name).toBe(expected);
        });
    });

    // #endregion repositoriesByAndculture

    // -----------------------------------------------------------------------------------------
    // #region repositoriesByOrganization
    // -----------------------------------------------------------------------------------------

    describe("repositoriesByOrganization", () => {
        test(`given no organization, returns list of main ${Github.andcultureOrg} repositories`, async () => {
            // Arrange
            const expected = Github.andcultureOrg;

            nock(Github.apiRootUrl)
                .get(getReposRoute(expected)) // make sure Github is properly passed username
                .reply(200, [{ name: expected }]);

            // Act
            const results = await Github.repositoriesByOrganization();

            // Assert
            expect(results).toHaveLength(1);
            expect(results![0].name).toBe(expected);
        });

        test(`given organization, returns list of main ${Github.andcultureOrg} repositories`, async () => {
            // Arrange
            const expected = TestUtils.randomWord();

            nock(Github.apiRootUrl)
                .get(getReposRoute(expected)) // make sure Github is properly passed username
                .reply(200, [{ name: expected }]);

            // Act
            const results = await Github.repositoriesByOrganization(expected);

            // Assert
            expect(results).toHaveLength(1);
            expect(results![0].name).toBe(expected);
        });

        test(`given filter, returns list of main ${Github.andcultureOrg} repositories matched by filter`, async () => {
            // Arrange
            const expected = Github.andcultureOrg;
            const unexpected = TestUtils.randomWord();

            nock(Github.apiRootUrl)
                .get(getReposRoute(expected)) // make sure Github is properly passed username
                .reply(200, [{ name: expected }, { name: unexpected }]);

            const filter = (repos: Repository[]) =>
                repos.filter((r: Repository) => r.name.startsWith(expected));

            // Act
            const results = await Github.repositoriesByOrganization(
                expected,
                filter
            );

            // Assert
            expect(results).toHaveLength(1);
            expect(results![0].name).toBe(expected);
        });
    });

    // #endregion repositoriesByAndculture

    // -----------------------------------------------------------------------------------------
    // #region removeTopicFromAllRepositories
    // -----------------------------------------------------------------------------------------

    describe("removeTopicFromAllRepositories", () => {
        test(`it calls removeTopicFromRepository for each ${Github.andcultureOrg} repo`, async () => {
            // Arrange
            const topic = TestUtils.randomWord();
            const repos = [
                { name: "AndcultureCode.Cli" },
                { name: "AndcultureCode.CSharp.Core" },
            ];

            // Mock the API response for repositories
            nock(Github.apiRootUrl)
                .get(getReposRoute(Github.andcultureOrg))
                .reply(200, repos);

            const removeTopicSpy = jest
                .spyOn(Github, "removeTopicFromRepository")
                .mockResolvedValue([]);

            // Mock the confirmation prompt since we do not have user input
            jest.spyOn(Prompt, "confirmOrExit").mockResolvedValueOnce();

            // Act
            await Github.removeTopicFromAllRepositories(topic);

            // Assert
            expect(removeTopicSpy).toHaveBeenCalledTimes(repos.length);
        });
    });

    // #endregion removeTopicFromAllRepositories

    // -----------------------------------------------------------------------------------------
    // #region removeTopicFromRepository
    // -----------------------------------------------------------------------------------------

    describe("removeTopicFromRepository", () => {
        let shellExitSpy: jest.SpyInstance;
        beforeEach(() => {
            shellExitSpy = TestUtils.spyOnShellExit();
        });

        test.each([undefined, null, "", " "])(
            "given topic is %p, it outputs an error and calls shell.exit",
            async (topic) => {
                // Arrange
                const owner = TestUtils.randomWord();
                const repoName = TestUtils.randomWord();
                const echoErrorSpy = jest.spyOn(Echo, "error");

                // Act
                await Github.removeTopicFromRepository(
                    topic as string,
                    owner,
                    repoName
                );

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalled();
            }
        );

        test.each([undefined, null, "", " "])(
            "given owner is %p, it outputs an error and calls shell.exit",
            async (owner) => {
                // Arrange
                const topic = TestUtils.randomWord();
                const repoName = TestUtils.randomWord();
                const echoErrorSpy = jest.spyOn(Echo, "error");

                // Act
                await Github.removeTopicFromRepository(
                    topic,
                    owner as string,
                    repoName
                );

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalled();
            }
        );

        test.each([undefined, null, "", " "])(
            "given repoName is %p, it outputs an error and calls shell.exit",
            async (repoName) => {
                // Arrange
                const topic = TestUtils.randomWord();
                const owner = TestUtils.randomWord();
                const echoErrorSpy = jest.spyOn(Echo, "error");

                // Act
                await Github.removeTopicFromRepository(
                    topic,
                    owner,
                    repoName as string
                );

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(shellExitSpy).toHaveBeenCalled();
            }
        );

        describe("given a topic, owner, and repoName", () => {
            test("it calls the topic api and returns the updated topics", async () => {
                // Arrange
                const topic = TestUtils.randomWord();
                const owner = TestUtils.randomWord();
                const repoName = TestUtils.randomWord();
                const existingTopics = [topic];
                const expectedTopics: any = [];

                // We'll want to mock the token so that CI environments aren't left hanging
                jest.spyOn(Github, "getToken").mockResolvedValue(
                    TestUtils.randomWord()
                );

                // Mock the call to get existing topics
                nock(Github.apiRootUrl)
                    .get(getRepoTopicsRoute(owner, repoName))
                    .reply(200, { names: existingTopics });

                // Mock the PUT API call to update topics
                nock(Github.apiRootUrl)
                    .put(getRepoTopicsRoute(owner, repoName))
                    .reply(200, { names: expectedTopics });

                // Act
                const result = await Github.removeTopicFromRepository(
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
                const repoName = TestUtils.randomWord();
                const echoErrorSpy = jest.spyOn(Echo, "error");

                // Act
                const result = await Github.topicsForRepository(
                    owner as string,
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
                const owner = TestUtils.randomWord();
                const echoErrorSpy = jest.spyOn(Echo, "error");

                // Act
                const result = await Github.topicsForRepository(
                    owner,
                    repoName as string
                );

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(result).toBeUndefined();
            }
        );

        describe("given an owner and repoName", () => {
            let owner: string;
            let repoName: string;
            let mockRepoTopicsRoute: RegExp;

            beforeEach(() => {
                owner = TestUtils.randomWord();
                repoName = TestUtils.randomWord();
                mockRepoTopicsRoute = getRepoTopicsRoute(owner, repoName);
            });

            test("when response is successful, it returns an array of topic names", async () => {
                // Arrange
                const expectedTopics = [
                    TestUtils.randomWord(),
                    TestUtils.randomWord(),
                ];

                nock(Github.apiRootUrl)
                    .get(mockRepoTopicsRoute)
                    .reply(200, { names: expectedTopics });

                // Act
                const result = await Github.topicsForRepository(
                    owner,
                    repoName
                );

                // Assert
                expect(result).toStrictEqual(expectedTopics);
            });

            test("when response.data is null, it outputs an error and returns undefined", async () => {
                // Arrange
                const echoErrorSpy = jest.spyOn(Echo, "error");
                const responseData: any = null; // This is the important setup

                nock(Github.apiRootUrl)
                    .get(mockRepoTopicsRoute)
                    .reply(200, responseData);

                // Act
                const result = await Github.topicsForRepository(
                    owner,
                    repoName
                );

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(result).toBeUndefined();
            });

            test("when response.status < 200, it outputs an error and returns undefined", async () => {
                // Arrange
                const responseStatus = TestUtils.randomNumber(0, 199); // This is the important setup
                const responseData: any = null;
                const echoErrorSpy = jest.spyOn(Echo, "error");

                nock(Github.apiRootUrl)
                    .get(mockRepoTopicsRoute)
                    .reply(responseStatus, responseData);

                // Act
                const result = await Github.topicsForRepository(
                    owner,
                    repoName
                );

                // Assert
                expect(echoErrorSpy).toHaveBeenCalled();
                expect(result).toBeUndefined();
            });

            test("when response.status > 202, it outputs an error and returns undefined", async () => {
                // Arrange
                const responseStatus = TestUtils.randomNumber(203); // This is the important setup
                const responseData: any = null;
                const echoErrorSpy = jest.spyOn(Echo, "error");

                nock(Github.apiRootUrl)
                    .get(mockRepoTopicsRoute)
                    .reply(responseStatus, responseData);

                // Act
                const result = await Github.topicsForRepository(
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
