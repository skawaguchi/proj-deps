import {getMarkdown} from '../../../src/utils/get-markdown';

import tap from 'tap';
import {stripIndents} from 'common-tags';

import {NO_CONTENT_MESSAGE} from '../../../src/constants/content';

tap.test('getMarkdown()', t => {
    t.test('given dependencies', assert => {
        const dependencies = {
            modules: [
                {
                    packages: [
                        {
                            dependencies: {
                                someDep: 'someVersion',
                                someOtherDep: 'someOtherVersion'
                            },
                            name: 'somePackage'
                        },
                        {
                            dependencies: {
                                anotherDep: 'anotherVersion'
                            },
                            name: 'anotherPackage'
                        }
                    ],
                    name: 'someModule'
                },
                {
                    packages: [
                        {
                            dependencies: {
                                yetAnotherDep: 'yetAnotherVersion'
                            },
                            name: 'yetAnotherPackage'

                        }
                    ],
                    name: 'yetAnotherModule'
                }
            ], timestamp: 'someTimeStamp'
        };

        const result = getMarkdown(dependencies);

        const expectedDependencyText = stripIndents`
        # Project Dependencies

        Generated: someTimeStamp

        ## someModule

        ### somePackage

        * someDep: someVersion
        * someOtherDep: someOtherVersion

        ### anotherPackage

        * anotherDep: anotherVersion

        ## yetAnotherModule

        ### yetAnotherPackage

        * yetAnotherDep: yetAnotherVersion
        `;
        const expectedResult = `${expectedDependencyText}\n`;

        assert.equal(expectedResult, result, 'return the expected markdown');

        assert.end();
    });

    t.test('given no dependencies', assert => {
        const dependencies = {
            modules: [
                {
                    packages: [],
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
