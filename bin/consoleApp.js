import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { QUERY_PARAMS, QUERY_PARAM_TYPES } from './constants.js';
import { LogHunter } from './logHunter.js';
import { isBlankOrNull } from './utils/stringHelpers.js';
import { createDate, localDateTime } from './utils/dateHelpers.js';
import { LogChef } from './logChef.js';

export class ConsoleApp {

    static rl = readline.createInterface({ input, output });

    static async run() {
        const paramsObj = await ConsoleApp.#collectQueryParams();
        const hunter = new LogHunter(paramsObj);
        console.log(this.#preQueryReport(hunter));
        await hunter.huntLogs();
        if (hunter.parsingErrors.length) {
            console.log('The following files were not parsed successfully:\n');
            const errorFileNames = hunter.parsingErrors.map(e => e.logFileName);
            for (let fileName of errorFileNames) {
                console.log('\t' + fileName + '\n');
            }
        }
        if (hunter.capturedLogs.length) {
            console.log(`Successfully captured and prepped ${hunter.capturedLogs.length === 1 ? '1 log' : hunter.capturedLogs.length+' logs'}...`);
            const chef = new LogChef(hunter.capturedLogs);
            console.log('Cooking logs...');
            await chef.cookLogs();
            console.log('Logs have been served.');
            console.log(`Head to C:\\hunter\\${chef.currentReportDirectoryName} to see the completed reports.`);
        }
        else console.log('0 logs found');
        
        const shouldContinueUserInput = (await ConsoleApp.#prompt("Keep hunting? (y/n)\n--> ", false)).toUpperCase();
        return shouldContinueUserInput === "Y";
    }

    /**
     * Prompts user for query parameters needed to hunt for logs
     * @returns {Promise<Array>} Array of the collected necessary params
     */
    static async #collectQueryParams() {
        let params = {};

        for (const param of QUERY_PARAMS) {
            let userParamInput;
            switch(param.type) {
                case (QUERY_PARAM_TYPES.SELECT):
                    const menu = ConsoleApp.#selectionMenu(param.options, param.name);
                    const selection = await ConsoleApp.#prompt(menu);
                    userParamInput = !isBlankOrNull(selection) ? ConsoleApp.#getSelection(param.options, selection) : null;
                    break;
                case (QUERY_PARAM_TYPES.INPUT):
                    let input;
                    if (param.isDate) {
                        input = await ConsoleApp.#prompt(`${param.name} ${param.format}: `);
                        userParamInput = !isBlankOrNull(input) ? createDate(input) : null;
                    } else {
                        input = await ConsoleApp.#prompt(`${param.name}: `);
                        userParamInput = !isBlankOrNull(input) ? input : null;
                    }
                    break;
            }
            params[param.key] = userParamInput;
        }
        return params;
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
    static #preQueryReport(hunter) {
        console.clear();
        let parameterStrings = QUERY_PARAMS.map( param => {
            if (param.isDate) return `${param.name}: ${localDateTime(hunter[param.key])}\n`;
            return hunter[param.key] !== null ? `${param.name}: ${hunter[param.key]}\n` : null;
        });
        return `Hunting for logs within the following parameters:\n` +
                '---------------------------------------------------\n' +
                parameterStrings.join('') +
                '---------------------------------------------------';
    }

    static end() {
        ConsoleApp.rl.close();
    }
}