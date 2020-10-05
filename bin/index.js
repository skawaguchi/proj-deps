#!/usr/bin/env node

const {makeProgram} = require('../src/program-factory');
const {manageDependencies} = require('../src/commands/manage-dependencies');

const program = makeProgram();

// The program has to be configured here because as soon as the command
// is imported into the program factory, coverage breaks for some reason.
program.command('deps')
    .option('-p, --path [path]', 'Path to project configuration.')
    .action(manageDependencies);

program.parse(process.argv);
