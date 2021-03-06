import {makeProgram} from '../../src/program-factory';

import tap from 'tap';
import sinon from 'sinon';

import fs from 'fs';
import commander from 'commander';

import dotenv from 'dotenv';

tap.test('program', t => {
    const fsStub = sinon.stub(fs, 'readFileSync');
    const versionStub = sinon.stub(commander.Command.prototype, 'version');
    const dotenvConfigStub = sinon.stub(dotenv, 'config');

    const version = 'someVersion';

    t.beforeEach(done => {
        dotenvConfigStub.reset();
        fsStub.reset();

        fsStub.returns(JSON.stringify({
            version
        }));

        done();
    });

    t.test('start the commander program', assert => {
        const program = makeProgram();

        assert.ok(program instanceof commander.Command, 'new program instantiated');
        assert.ok(dotenvConfigStub.calledOnce, 'initialize environment variables');

        assert.end();
    });

    t.test('program version', assert => {
        makeProgram();

        assert.equal(fsStub.calledOnceWith(sinon.match.string, {encoding: 'utf8'}), true, 'package.json file gotten');
        assert.equal(versionStub.getCall(0).args[0], version, 'version set from json');

        assert.end();
    });

    t.end();
});
