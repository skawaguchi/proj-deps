const {stripIndents} = require('common-tags');
const {NO_CONTENT_MESSAGE} = require('../constants/content');

const getPackageText = (accumulator, packageName, packageText) => {
    return stripIndents`${accumulator}
    ### ${packageName}

    ${packageText}
    `;
};

const getPackageLines = packages => {
    return packages.reduce((accumulator, packageContent) => {
        const packageText = Object.entries(packageContent.dependencies)
            .map(entry => {
                return `* ${entry[0]}: ${entry[1]}`;
            })
            .join('\n');

        return `${getPackageText(accumulator, packageContent.name, packageText)}\n`;
    }, '');
};

const hasPackages = packages => Object.keys(packages).length > 0;

const getModuleText = (accumulator, moduleName, packageText) => {
    return stripIndents`${accumulator}\n
        ## ${moduleName}

        ${packageText}
        `;
};

const getMarkdown = dependencies => {
    const title = stripIndents`# Project Dependencies

    Generated: ${dependencies.timestamp}
    `;
    const message =
        dependencies.modules.reduce((accumulator, moduleContent) => {
            const packageText = hasPackages(moduleContent.packages) ?
                getPackageLines(
                    moduleContent.packages
                ) : NO_CONTENT_MESSAGE;

            return getModuleText(
                accumulator,
                moduleContent.name,
                packageText
            );
        }, title);

    return `${message}\n`;
};

module.exports = {
    getMarkdown
};
