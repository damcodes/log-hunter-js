import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { APP_NAMES, LOG_LEVELS } from './constants.js';
import { LogHunter } from './logHunter.js';

export class ConsoleApp {

    static rl = readline.createInterface({ input, output });

    static async run() {
        const appNameSelectionInput = await ConsoleApp.#prompt(ConsoleApp.#selectionMenu(APP_NAMES, 'App Name'));
        const appName = ConsoleApp.#getSelection(APP_NAMES, appNameSelectionInput);

        const logLevelSelectionInput = await ConsoleApp.#prompt(ConsoleApp.#selectionMenu(LOG_LEVELS, 'Log Level'));
        const logLevel = this.#getSelection(LOG_LEVELS, logLevelSelectionInput);

        const startDateStr = await ConsoleApp.#prompt("Start Date (mm-dd-YYYY HH:mm:ss): ");
        const startDate = !ConsoleApp.#inputIsBlank(startDateStr) ? this.#createDate(startDateStr) : null;

        const endDateStr = await ConsoleApp.#prompt("End Date (mm-dd-YYYY HH:mm:ss): ");
        const endDate = !ConsoleApp.#inputIsBlank(endDateStr) ? this.#createDate(endDateStr) : null;

        const hunter = new LogHunter(appName, startDate, endDate, logLevel);
        console.log(this.#preQueryReport(hunter.appName, hunter.startDate, hunter.endDate, hunter.logLevel));
        hunter.huntLogs();
        console.log(`Found ${hunter.logs.length} logs\n`);

        const shouldContinueUserInput = (await ConsoleApp.#prompt("Continue? (y/n)\n--> ", false)).toUpperCase();
        return shouldContinueUserInput === "Y" ? true : false;
    }

    /**
     * Prints message string to console and waits for user input
     * @param {String} message 
     * @param {Boolean} clearConsole 
     * @returns Promise containing user input string
     */
    static async #prompt(message, clearConsole = true) {
        if (clearConsole) console.clear(); //possibly remove for final
        return (await ConsoleApp.rl.question(message)).trim();
    }

    /**
     * Accepts an array of menu items and maps over them to 
     * return a string "n) menu item"
     * @param {Array} menuArr - array of menu items
     * @param {String} menuType - label for selection ex: 'Select App Name', App Name is menu type
     * @returns formated selection menu string
     */
    static #selectionMenu(menuArr, menuType) {
        return `Select ${menuType}:\n${menuArr.map((menuOption, idx) => `${idx+1}) ${menuOption}`).join('\n')}\n--> `;
    }

    /**
     * Accepts an array of menu items and user input and returns the selected menu item
     * @param {Array} menuArr 
     * @param {String} userSelectionInput 
     * @returns selected menu item string
     */
    static #getSelection(menuArr, userSelectionInput) {
        let idx = parseInt(userSelectionInput) - 1;
        return menuArr[idx];
    }

    /**
     * 
     * @param {String} appName 
     * @param {Date} startDate 
     * @param {Date} endDate 
     * @param {String} logLevel 
     */
    static #preQueryReport(appName, startDate, endDate, logLevel) {
        console.clear();
        const appNameLabel = `App name: ${appName}`;
        const dateRangeLabel = 'Timeframe: ' +  
                                `${startDate.toLocaleDateString() + ' ' + startDate.toLocaleTimeString()}` + 
                                ' to ' + 
                                `${endDate.toLocaleDateString() + ' ' + endDate.toLocaleTimeString()}`;
        const logLevelLabel = `Log Severity Level: ${logLevel}`;
        return `Searching for logs within the following parameters:\n` +
                '---------------------------------------------------\n' +
                appNameLabel + '\n' +
                dateRangeLabel + '\n' +
                logLevelLabel + '\n' +
                '---------------------------------------------------';
    }

    static #inputIsBlank(str) {
        return (!str || /^\s*$/.test(str));
    }

    /**
     * Accepts a dateTimeInput string to parse.
     * If time part is present, returns Date object with specified time,
     * Else returns Date object for 12 am of specified date
     * @param {String} dateTimeInput - user input date string
     * @returns 
     */
    static #createDate(dateTimeInput) {
        const dateTimeSplit = dateTimeInput.split(' ');
        const datePart = dateTimeSplit[0];
        const [ month, day, year ] = datePart.split('-').map( val => parseInt(val));
        
        const timePart = dateTimeSplit[1] || null;
        if (!timePart) return new Date(year, month - 1, day, 0, 0, 0);
        const [ hour, minute, seconds ] = timePart.split(':').map( val => parseInt(val));

        return new Date(year, month - 1, day, hour, minute, seconds);
    }

    static end() {
        ConsoleApp.rl.close();
    }
}