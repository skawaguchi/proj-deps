import { getMarkdown } from '../../../src/utils/get-markdown';

import tap from 'tap';
import { stripIndents } from 'common-tags';

import { NO_CONTENT_MESSAGE } from '../../../src/constants/content';

tap.test('getMarkdown()', (t) => {
    t.test('given dependencies', (assert) => {
        const dependencies = {
            modules: [
                {
                    dependencies: {
                        someDep: 'someVersion',
                        someOtherDep: 'someOtherVersion'
                    },
                    name: 'someModule'
                },
                {
                    dependencies: {
                        anotherDep: 'anotherVersion'
                    },
                    name: 'anotherModule'
                }
            ], timestamp: 'someTimeStamp'
        };

        const result = getMarkdown(dependencies);

        const expectedDependencyText = stripIndents`
        # Project Dependencies

        Generated: someTimeStamp

        ## someModule

        * someDep: someVersion
        * someOtherDep: someOtherVersion

        ## anotherModule

        * anotherDep: anotherVersion
        `;
        const expectedResult = `${expectedDependencyText}\n`;

        assert.equal(expectedResult, result, 'return the expected markdown');

        assert.end();
    });

    t.test('given no dependencies', (assert) => {
        const dependencies = {
            modules: [
                {
                    dependencies: {},
                    name: 'someModule'
                }
            ], timestamp: 'someTimeStamp'
        };

        const result = getMarkdown(dependencies);

        const expectedDependencyText = stripIndents`
        # Project Dependencies

        Generated: someTimeStamp

        ## someModule

        ${NO_CONTENT_MESSAGE}
        `;
        const expectedResult = `${expectedDependencyText}\n`;

        assert.equal(expectedResult, result, 'return the expected markdown');

        assert.end();
    });

    t.end();
});
