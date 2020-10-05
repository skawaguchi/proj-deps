import {getConfigFile, sendQuery} from '../../../src/utils/github-api';

import tap from 'tap';
import sinon from 'sinon';

import fs from 'fs';
import got from 'got';

tap.test('getConfigFile()', t => {
    const fsStub = sinon.stub(fs, 'readFileSync');
    const consoleErrorStub = sinon.stub(console, 'error');

    t.beforeEach(done => {
        fsStub.reset();
        consoleErrorStub.reset();

        done();
    });

    t.test('given no path', assert => {
        const expectedDefaultPath = './config/example-config.json';

        fsStub.returns(JSON.stringify({}));

        getConfigFile();

        assert.ok(fsStub.calledOnceWithExactly(expectedDefaultPath, {encoding: 'utf8'}), 'the default example file in the fixtures test code is used');

        assert.end();
    });

    t.test('given a valid json path', assert => {
        const filePath = 'some/file/path/someFile.json';

        fsStub.returns(JSON.stringify({}));

        getConfigFile(filePath);

        assert.contains(fsStub.getCall(0).args[0], filePath, 'filepath is passed on');
        assert.sameStrict(fsStub.getCall(0).args[1], {encoding: 'utf8'}, 'file is encoded as a string');

        assert.end();
    });

    t.test('given an invalid json path', assert => {
        const filePath = 'some/file/path/someFile.notJson';

        assert.throws(() => getConfigFile(filePath), 'error for non-json file');

        const directoryPath = 'some/file/path/someFile.notJson';

        assert.throws(() => getConfigFile(directoryPath), 'error for directory');

        assert.end();
    });

    t.test('returns the file content', assert => {
        const expectedResult = {some: 'json content'};

        fsStub.returns(JSON.stringify(expectedResult));

        const result = getConfigFile();

        assert.sameStrict(result, expectedResult, 'returns the file content');

        assert.end();
    });

    t.end();
});

tap.test('sendQuery()', t => {
    const postStub = sinon.stub(got, 'post');
    const apiURL = 'http://some.api/url';
    const tokenName = 'someName';

    tap.beforeEach(done => {
        postStub.reset();
        done();
    });

    t.test('make a post call', async assert => {
        const query = {
            some: 'query'
        };

        postStub.resolves({body: JSON.stringify({})});

        const token = 'someToken';
        process.env[tokenName] = token;

        await sendQuery(apiURL, tokenName, query);

        const expectedQuery = {
            headers: {
                accept: 'application/json',
                authorization: `Bearer ${token}`
            },
            json: query
        };

        assert.equal(apiURL, postStub.getCall(0).args[0], 'the endpoint is called');
        assert.sameStrict(expectedQuery, postStub.getCall(0).args[1], 'the query has been sent with the appropriate headers');

        delete process.env[tokenName];

        assert.end();
    });

    t.test('returns the data from the response', async assert => {
        const data = {
            some: 'data'
        };
        const response = {
            body: JSON.stringify(data)
        };

        postStub.resolves(response);

        const returnedValue = await sendQuery(apiURL, tokenName, {});

        assert.sameStrict(returnedValue, data, 'the data from the response is returned');

        assert.end();
    });

    t.test('when the call fails', assert => {
        const error = {
            some: 'error'
        };

        postStub.rejects(error);

        assert.rejects(() => sendQuery(), new Error(error), 'rejects the error');

        assert.end();
    });

    t.end();
});
