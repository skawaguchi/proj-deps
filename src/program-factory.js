const commander = require('commander');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const makeProgram = () => {
    dotenv.config();

    const packageFile = fs.readFileSync(
        path.resolve(__dirname, '../package.json'),
        {encoding: 'utf8'}
    );
    const packageContent = JSON.parse(packageFile);

    const program = new commander.Command();

    program.version(packageContent.version);

    return program;
};

module.exports = {
    makeProgram
};
