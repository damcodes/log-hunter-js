#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { ConsoleApp } from './consoleApp.js';

const argv = yargs(hideBin(process.argv))
    .option('1d', {
        alias: '1dayHunt',
        demandOption: false,
        default: false,
        type: 'boolean',
        describe: 'Is a one day hunt'
    }).argv;

const isOneDayHunt = argv['1d'];

let run;
do run = await ConsoleApp.run(isOneDayHunt)
while (run);
ConsoleApp.end();