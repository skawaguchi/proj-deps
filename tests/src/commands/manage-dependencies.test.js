import {manageDependencies} from '../../../src/commands/manage-dependencies';

import tap from 'tap';
import sinon from 'sinon';

import fs from 'fs';

import * as getDependencyUtils from '../../../src/utils/get-dependencies';
import * as getMarkdownUtils from '../../../src/utils/get-markdown';

tap.test('manageDependencies()', t => {
    const getDependenciesStub = sinon.stub(getDependencyUtils, 'getDependencies');
    const getMarkdownStub = sinon.stub(getMarkdownUtils, 'getMarkdown');
    const writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
    const consoleInfoStub = sinon.stub(console, 'info');
    const consoleErrorStub = sinon.stub(console, 'error');

    t.beforeEach(done => {
        getDependenciesStub.reset();
        getMarkdownStub.reset();
        writeFileSyncStub.reset();
        consoleInfoStub.reset();
        consoleErrorStub.reset();
        done();
    });

    t.test('retrieve the dependencies config data', async assert => {
        const options = {
            some: 'options'
        };

        getDependenciesStub.resolves({});
        getMarkdownStub.returns('');

        await manageDependencies(options);

        assert.ok(getDependenciesStub.calledOnceWith(options), 'get dependencies call made');

        assert.end();
    });

    t.test('convert data to markdown', async assert => {
        const expectedData = {
            some: 'data'
        };
        getDependenciesStub.resolves(expectedData);
        getMarkdownStub.returns('');

        await manageDependencies({});

        assert.equal(expectedData, getMarkdownStub.getCall(0).args[0], 'pass the dependency data to the markdown converter');
    });

    t.test('write markdown to file', async assert => {
        const expectedMarkdown = 'some markdown';

        getDependenciesStub.resolves({});
        getMarkdownStub.returns(expectedMarkdown);

        await manageDependencies({});

        const expectedOptions = {
            encoding: 'utf8'
        };

        assert.equal('dependencies.md', writeFileSyncStub.getCall(0).args[0], 'write the dependencies.md file');
        assert.equal(expectedMarkdown, writeFileSyncStub.getCall(0).args[1], 'pass the markdown to write to the file');
        assert.sameStrict(expectedOptions, writeFileSyncStub.getCall(0).args[2], 'set the options of the file');

        assert.sameStrict(expectedMarkdown, consoleInfoStub.getCall(0).args[0], 'output the markdown to the console');
    });

    t.test('when the attempt to write the file fails', async assert => {
        getDependenciesStub.resolves({});
        getMarkdownStub.returns('some markdown');

        const error = 'some error';
        writeFileSyncStub.throws(error);

        const callMethod = () => {
            return manageDependencies({});
        };

        await assert.rejects(callMethod, new Error(error), 'rejects the error');
    });

    t.end();
});
