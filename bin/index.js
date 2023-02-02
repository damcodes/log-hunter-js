#!/usr/bin/env node

import * as xml2js from 'xml2js';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { LogHunter } from './logHunter.js';

const APP_NAMES = [
    "WeRequest", 
    "WeAccess", 
    "EMileage", 
    "ChromeRiver",
    "CobbleStone",
    "TWISTChk", 
    "TWISTProvider", 
    "Recoupment",
    "UltiProDownloadService",
    "Common.WebSvc",
    "PasswordReset.Web",
    "RoomSchedule"
]

const rl = readline.createInterface({ input, output });

const logDirInput = await prompt("Absolute path to log directory: ");

const appNameSelectionInput = await prompt(appNamesMenu());
const appName = determineAppName(appNameSelectionInput);

let logLevel = await prompt("Select Log Level:\n1) Error\n2) Warning\n--> ");
logLevel = logLevel === "1" ? "Error" : "Warning";

const startDateStr = await prompt("Start Date (YYYY-mm-dd HH:mm:ss): ");
const startDate = !isBlank(startDateStr) ? new Date(startDateStr) : null;
const endDateStr = await prompt("End Date (YYYY-mm-dd HH:mm:ss): ");
const endDate = !isBlank(endDateStr) ? new Date(endDateStr) : null;

const hunter = new LogHunter(logDirInput, appName, startDate, endDate, logLevel);
const logs = hunter.huntLogs();
console.log(logs);

rl.close();


async function prompt(message) {
    console.clear();
    return (await rl.question(message)).trim();
}

function appNamesMenu() {
    return `Select App:\n${APP_NAMES.map( (name, idx) => `${idx+1}) ${name}`).join('\n')}\n--> `;
}

function determineAppName(input) {
    let idx = parseInt(input) - 1;
    return APP_NAMES[idx];
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}