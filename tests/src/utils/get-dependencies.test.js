import {getDependencies} from '../../../src/utils/get-dependencies';

import tap from 'tap';
import sinon from 'sinon';

import githubAPIUtil from '../../../src/utils/github-api';

import {DateTime} from 'luxon';

import {stripIndents} from 'common-tags';
import Chance from 'chance';

const chance = new Chance();

tap.test('getDependencies()', t => {
    const getConfigFileStub = sinon.stub(githubAPIUtil, 'getConfigFile');
    const sendQueryStub = sinon.stub(githubAPIUtil, 'sendQuery');
    const utcStub = sinon.stub(DateTime, 'utc');
    const consoleErrorStub = sinon.stub(console, 'error');

    t.beforeEach(done => {
        getConfigFileStub.reset();
        sendQueryStub.reset();
        utcStub.reset();
        consoleErrorStub.reset();
        done();
    });

    const getPackageMock = () => {
        const branch = chance.string();
        const filepath = chance.string();

        return {
            branch,
            filepath
        };
    };

    const getRepoMock = (name, packages = [getPackageMock()]) => {
        const owner = chance.string();

        return {
            name,
            owner,
            packages
        };
    };

    t.test('call the github api to get packages', async assert => {
        const path = 'some/path';
        const options = {
            path
        };

        const firstConfig = getRepoMock('someRepo');
        const secondConfig = getRepoMock('some-other-repo', [
            getPackageMock(),
            getPackageMock()
        ]);

        const configResult = {
            githubAPI: 'http://some.api/url',
            githubTokenName: 'someToken',
            repositories: [
                firstConfig,
                secondConfig
            ]
        };

        sendQueryStub.resolves({
            data: {
                repository: {
                    somePackage: {
                        text: '{}'
                    }
                }
            }
        });

        getConfigFileStub.returns(configResult);

        await getDependencies(options);

        assert.ok(getConfigFileStub.calledOnceWithExactly(path), 'config file gets retrieved');

        const expectedFirstQuery = {
            query: stripIndents`query {
                repository (owner: "${firstConfig.owner}", name: "${firstConfig.name}") {
                    someRepo1: object(expression: "${firstConfig.packages[0].branch}:${firstConfig.packages[0].filepath}") {
                        ... on Blob {
                            text
                        }
                    }
                }
            }`
        };

        const expectedSecondQuery = {
            query: stripIndents`query {
                repository (owner: "${secondConfig.owner}", name: "${secondConfig.name}") {
                    someOtherRepo1: object(expression: "${secondConfig.packages[0].branch}:${secondConfig.packages[0].filepath}") {
                        ... on Blob {
                            text
                        }
                    }
                    someOtherRepo2: object(expression: "${secondConfig.packages[1].branch}:${secondConfig.packages[1].filepath}") {
                        ... on Blob {
                            text
                        }
                    }
                }
            }`
        };

        assert.ok(sendQueryStub.calledTwice, 'query is sent');
        assert.ok(sendQueryStub.calledWith(configResult.githubAPI, configResult.githubTokenName), 'first call query payload is correct');
        assert.strictSame(expectedFirstQuery, sendQueryStub.getCall(0).args[2], 'first call query payload is correct');
        assert.strictSame(expectedSecondQuery, sendQueryStub.getCall(1).args[2], 'second call query payload is correct');

        assert.end();
    });

    t.test('Given valid deps it returns entries for all of the repos and packages within them', async assert => {
        const path = 'some/path';
        const options = {
            path
        };
        const firstRepoName = 'someRepo';
        const secondRepoName = 'someOtherRepo';

        getConfigFileStub.returns({
            repositories: [
                getRepoMock(firstRepoName),
                getRepoMock(secondRepoName)
            ]
        });

        const firstPackageJSON = {
            dependencies: {
                'some-module': '0.0.0',
                someOtherModule: '~1.1.1',
                yetAnotherModule: '^2.2.2'
            },
            name: 'some-package'
        };

        const secondPackageJSON = {
            dependencies: {
                andYetAnotherModule: '3.3.3'
            },
            name: 'another-package'
        };

        const thirdPackageJSON = {
            dependencies: {
                aFinalModule: '4.4.4'
            },
            name: 'a-final-package'
        };

        sendQueryStub
            .onCall(0).resolves({
                data: {
                    repository: {
                        somePackage: {
                            text: JSON.stringify(firstPackageJSON)
                        }
                    }
                }
            })
            .onCall(1).resolves({
                data: {
                    repository: {
                        anotherPackage: {
                            text: JSON.stringify(secondPackageJSON)
                        },
                        aFinalPackage: {
                            text: JSON.stringify(thirdPackageJSON)
                        }
                    }
                }
            });

        const expectedDate = 'someUTCDate';
        utcStub.returns(expectedDate);

        const result = await getDependencies(options);

        const expectedResult = {
            modules: [
                {
                    packages: [
                        {
                            dependencies: firstPackageJSON.dependencies,
                            name: firstPackageJSON.name
                        }
                    ],
                    name: firstRepoName
                },
                {
                    packages: [
                        {
                            dependencies: secondPackageJSON.dependencies,
                            name: secondPackageJSON.name
                        },
                        {
                            dependencies: thirdPackageJSON.dependencies,
                            name: thirdPackageJSON.name
                        }
                    ],
                    name: secondRepoName
                }
            ],
            timestamp: expectedDate
        };

        assert.strictSame(expectedResult, result, 'return the data from the call along with the UTC operation time stamp');

        assert.end();
    });

    t.test('given there is a package but no dependencies', async assert => {
        const repoName = 'someRepo';
        getConfigFileStub.returns({
            repositories: [
                getRepoMock(repoName)
            ]
        });

        const noDependenciesJSON = {
            name: 'no-deps'
        };

        sendQueryStub
            .onCall(0).resolves({
                data: {
                    repository: {
                        somePackage: {
                            text: JSON.stringify(noDependenciesJSON)
                        }
                    }
                }
            });

        const expectedDate = 'someUTCDate';
        utcStub.returns(expectedDate);

        const result = await getDependencies({});

        const expectedResult = {
            modules: [
                {
                    packages: [
                        {
                            dependencies: {},
                            name: 'no-deps'
                        }
                    ],
                    name: repoName
                }
            ],
            timestamp: expectedDate
        };

        assert.strictSame(expectedResult, result, 'return the data from the call along with the UTC operation time stamp');

        assert.end();
    });

    t.test('when the call fails', assert => {
        const path = 'some/path';
        const options = {
            projectFile: path
        };
        const firstRepoName = 'someRepo';
        const secondRepoName = 'someOtherRepo';

        getConfigFileStub.returns({
            repositories: [
                getRepoMock(firstRepoName),
                getRepoMock(secondRepoName)
            ]
        });

        const error = 'someError';

        sendQueryStub
            .onCall(0).rejects(error);

        const callMethod = () => {
            return getDependencies(options);
        };

        assert.rejects(callMethod, new Error(error), 'rejects the error');

        assert.end();
    });

    t.end();
});
