const {stripIndents} = require('common-tags');
const {NO_CONTENT_MESSAGE} = require('../constants/content');

const getDependencyLines = dependencies => {
    return Object.entries(dependencies)
        .map(entry => {
            return `* ${entry[0]}: ${entry[1]}`;
        })
        .join('\n');
};

const getMarkdown = dependencies => {
    const title = stripIndents`# Project Dependencies

    Generated: ${dependencies.timestamp}
    `;
    const message =
        dependencies.modules.reduce((accumulator, moduleContent) => {
            const dependencyText = Object.keys(moduleContent.dependencies).length > 0 ?
                getDependencyLines(
                    moduleContent.dependencies
                ) : NO_CONTENT_MESSAGE;

            return stripIndents`${accumulator}\n
            ## ${moduleContent.name}

            ${dependencyText}
        `;
        }, title);

    return `${message}\n`;
};

module.exports = {
    getMarkdown
};
