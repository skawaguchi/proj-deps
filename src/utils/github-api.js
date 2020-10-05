const fs = require('fs');
const got = require('got');

const getConfigFile = configFilePath => {
    const filePath = configFilePath ? configFilePath : './config/example-config.json';

    if (filePath.split('.').pop() !== 'json') {
        throw new Error(`You must pass the path to a JSON file. You passed ${filePath}.`);
    }

    console.info('get project file at', filePath);

    const fileContent = fs.readFileSync(filePath, {encoding: 'utf8'});

    return JSON.parse(fileContent);
};

const sendQuery = async (apiURL, tokenName, query) => {
    try {
        const response = await got.post(apiURL, {
            headers: {
                accept: 'application/json',
                authorization: `Bearer ${process.env[tokenName]}`
            },
            json: query
        });

        return JSON.parse(response.body);
    } catch (error) {
        console.error('query failed', error);
        throw new Error(error);
    }
};

module.exports = {
    getConfigFile,
    sendQuery
};
