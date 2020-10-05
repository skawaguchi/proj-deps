const githubAPIUtil = require('./github-api');
const {stripIndents} = require('common-tags');
const camelCase = require('camelcase');
const luxon = require('luxon');

const getPackagesQuery = (packageName, packages) => {
    return packages.map((packageObject, index) => {
        return `${packageName}${index + 1}: object(expression: "${packageObject.branch}:${packageObject.filepath}") {
            ... on Blob {
                text
            }
        }`;
    });
};

const getRepoQueries = config => {
    const repoQueries = config.repositories.map(repo => {
        const packageName = camelCase(repo.name);
        const query = `repository (owner: "${repo.owner}", name: "${repo.name}") {
            ${getPackagesQuery(packageName, repo.packages).join('\n')}
        }`;

        return {
            querySource: {
                query: stripIndents`query {
                    ${query}
                }`
            },
            repoName: repo.name
        };
    });

    return repoQueries;
};

const getDependencies = async options => {
    const config = githubAPIUtil.getConfigFile(options.path);
    const repoQueries = getRepoQueries(config);

    const {githubAPI, githubTokenName} = config;

    try {
        const allResults = await Promise.all(repoQueries.map(async query => {
            const packageResponse =
                await githubAPIUtil.sendQuery(
                    githubAPI,
                    githubTokenName,
                    query.querySource
                );

            return {
                package: packageResponse,
                repoName: query.repoName
            };
        }));

        const modules = allResults.map(result => {
            const {repository} = result.package.data;
            const parsedPackages = Object.keys(repository).map(packageName => {
                return JSON.parse(repository[packageName].text);
            });

            const packages = parsedPackages.map(packageContent => {
                return {
                    dependencies: packageContent.dependencies ? packageContent.dependencies : {},
                    name: packageContent.name
                };
            });

            return {
                packages,
                name: result.repoName
            };
        });

        return {
            modules,
            timestamp: luxon.DateTime.utc()
        };
    } catch (error) {
        console.error('The attempt to get dependencies failed', error);
        throw new Error(error);
    }
};

module.exports = {
    getDependencies
};
