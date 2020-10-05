const getDependenciesUtil = require('../utils/get-dependencies');
const getMarkdownUtil = require('../utils/get-markdown');
const fs = require('fs');

const manageDependencies = async options => {
    let dependencies;

    try {
        dependencies = await getDependenciesUtil.getDependencies(options);
    } catch (error) {
        console.error('The attempt to load dependencies failed', error);
        throw new Error(error);
    }

    try {
        const markdown = getMarkdownUtil.getMarkdown(dependencies);

        fs.writeFileSync('dependencies.md', markdown, {
            encoding: 'utf8'
        });

        console.info(markdown);
    } catch (error) {
        console.error('The attempt to write the markdown file failed', error);
        throw new Error(error);
    }
};

module.exports = {
    manageDependencies
};
