#!/usr/bin/env node

import { ConsoleApp } from './consoleApp.js';

let run;
do run = await ConsoleApp.run()
while (run);
ConsoleApp.end();