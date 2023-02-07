import * as xml2js from 'xml2js';
import { readdirSync, readFileSync } from 'fs';
import { LOG_DIRECTORY } from './constants.js';
import { isBlankOrNull, isHtmlLike, removeInvalidTagBrackets, formatAmpersands } from './utils/stringHelpers.js';
import { formatFileNameDateString, createDate, yesterday, now } from './utils/dateHelpers.js';

export class LogHunter {

    capturedLogs = [];
    appName = 'All';
    startDate = yesterday();
    endDate = now(); //logic error between endDate and startDate
    logLevel = 'All';
    samAcctName = null;

    /**
     * Dynamically creates LogHunter instance and assigns instance 
     * properties based on params defined in './constants.js'
     * and collected from user input
     * @param {Object} paramsObj 
     */
    constructor(paramsObj) {
        let fields = Object.keys(paramsObj);
        fields.forEach(field => this[field] = paramsObj[field] || this[field]);
    }

    async huntLogs() {
        const allLogs = readdirSync(LOG_DIRECTORY);
        const filteredLogFileNames = allLogs.filter(file => {
            const logNameParts = file.slice(0,-4).split('-');
            const [ logAppName, logLevel, logDateStr ] = logNameParts;
            const formattedLogDateStr = formatFileNameDateString(logDateStr);
            const logDate = createDate(formattedLogDateStr);
            return (
                logDate >= this.startDate && logDate <= this.endDate) && (
                logLevel === `NCI${this.logLevel}` || this.logLevel === 'All') && (
                logAppName === this.appName || this.appName === 'All'
            );
        });

        if (filteredLogFileNames.length) {
            await this.#parseLogs(filteredLogFileNames);
            this.#destructurePreTags();
            this.#destructureLogSubArrays();
            this.#dateStrToDateObj();
        }
    }

    async #parseLogs(logFileNames) {
        const xmlParseOption = {
            mergeAttrs: true,
            trim: true,
            normalize: true
        }
        for (let logFileName of logFileNames) {
            // let fileData = readFileSync(`${LOG_DIRECTORY}\\${logFileName}`); //uncomment for windows and delete above
            let fileData = readFileSync(`${LOG_DIRECTORY}/${logFileName}`); //uncomment for mac
            const parser = new xml2js.Parser(xmlParseOption);
            let { log } = await parser.parseStringPromise(fileData);
            for (let [key, [value]] of Object.entries(log)) {
                // try {
                if (value.length > 0 && isHtmlLike(value)) {
                    value = removeInvalidTagBrackets(value);
                    value = formatAmpersands(value);
                    log[key] = await parser.parseStringPromise(value);
                }
                // } catch(e) {
                //     debugger
                // }
            }
            if (!isBlankOrNull(this.samAcctName)) {
                if (log.user.some(nciName => nciName === `NCI\\${this.samAcctName}`))
                    this.capturedLogs.push(log);
                continue;
            } 
            this.capturedLogs.push(log);
        }
    }

    #destructurePreTags() {
        for (let log of this.capturedLogs) {
            for (let key in log) {
                if (!Array.isArray(log[key])) {
                    let arr = [];
                    if (Array.isArray(log[key].pre)) log[key].pre.forEach( el => arr.push(el));
                    else if (typeof log[key].pre === 'string') arr.push(log[key].pre);
                    else {
                        for (let innerKey in log[key].pre) {
                            if (innerKey !== 'br') arr.push(log[key]['pre'][innerKey]);
                        }
                    }
                    log[key] = arr;
                }
            }
        }
    }

    #destructureLogSubArrays() {
        this.capturedLogs = this.capturedLogs.map( log => {
            for (let key in log) {
                if (log[key].length === 1) {
                    if (log[key][0] === '') {
                        delete log[key];
                    }
                    else log[key] = log[key][0];
                    continue;
                }
                log[key] = log[key].flat().map(data => {
                    const keys = Object.keys(data);
                    if (typeof data === 'string') return data;
                    if (!Array.isArray(data) && keys.length) {
                        let arr = [];
                        for (const innerKey in data) {
                            arr.push(data[innerKey]);
                        }
                        return arr.length > 1 ? arr.join('|||') : arr[0];
                    }
                });
            }
            return log;
        })
    }

    #dateStrToDateObj() {
        this.capturedLogs = this.capturedLogs.map(log => {
            log.dateTime = createDate(log.dateTime, '/');
            return log;
        });
    }
}
