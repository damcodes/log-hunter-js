import * as xml2js from 'xml2js';
import { readdir, readFile } from 'fs/promises';
import { LOG_DIRECTORY } from './constants.js';
import { isBlankOrNull, isHtmlLike, htmlToString } from './utils/stringHelpers.js';
import { createDate, beginningOfYesterday, now, createDateFromFileName } from './utils/dateHelpers.js';

export class LogHunter {

    capturedLogs = [];
    appName = 'All';
    logLevel = 'All';

    /**
     * @type {Date}
     */
    endDate = now();

    /**
     * @type {Date}
     */
    startDate = beginningOfYesterday(this.endDate);

    /**
     * @type { string | null } 
     */
    samAcctName = null;

    /**
     * @type { [] | null }
     */
    exceptionMessageKeywords = null;

    /**
     * @type { [] | null }
     */
    filters = null;

    parsingErrors = [];

    /**
     * Dynamically creates LogHunter instance and assigns instance 
     * properties based on params defined in './constants.js'
     * and collected from user input
     * @param {Object} paramsObj 
     */
    constructor(paramsObj = null) {
        if (paramsObj) {
            const fields = Object.keys(paramsObj);
            fields.forEach(field => this[field] = paramsObj[field] || this[field]);
        }
    }

    async huntLogs() {
        const logs = (await readdir(LOG_DIRECTORY)).filter(fileName => {
            const logDate = createDateFromFileName(fileName.split('-')[2].slice(0, 8));
            const [logAppName, logLevel] = fileName.slice(0, -4).split('-');
            return (logDate >= this.startDate && logDate <= this.endDate) && (logLevel === `NCI${this.logLevel}` || this.logLevel === 'All') && (logAppName === this.appName || this.appName === 'All');
        });

        if (logs.length)
            (await this.#parseLogs(logs))
                .#destructurePreTags()
                .#flattenSubArrays()
                .#sortLogs();
    }

    /**
     * Parses the XML of each logFileName passed in. Removes HTML tags from 
     * exceptions, inner exceptions, and stack traces. This is where 
     * log filtering by SAMAccountName is done
     * @param {String[]} logFileNames 
     * @returns {Promise<this>} 
     */
    async #parseLogs(logFileNames) {
        const xmlParseOption = {
            mergeAttrs: true,
            trim: true,
            normalize: true
        }
        for (let logFileName of logFileNames) {
            const fileData = await readFile(`${LOG_DIRECTORY}/${logFileName}`);
            const parser = new xml2js.Parser(xmlParseOption);
            const { log } = await parser.parseStringPromise(fileData);
            log.logFileName = [logFileName];
            for (let [key, [value]] of Object.entries(log)) {
                try {
                    if (value.length > 0 && isHtmlLike(value)) {
                        if (['stackTrace', 'innerException', 'exception'].some(keyName => key === keyName))
                            log[key] = [htmlToString(value)];
                        else log[key] = await parser.parseStringPromise(value);
                    }
                } catch (e) {
                    const logParsingError = this.parsingErrors.find(logError => logError.logFileName === logFileName);
                    if (logParsingError) logParsingError.errors.push(e.message);
                    else this.parsingErrors.push({ errors: [e.message], logFileName });
                }
            }
            if (!this.#hasFilters()) 
                this.capturedLogs.push(log);
            else 
                if (this.#satisfiesFilters(log))
                    this.capturedLogs.push(log);
        }
        return this;
    }

    /**
     * After parseLogs(), there was still some sub elements of the object
     * that needed to be flattened and concatted so object only has depth 1
     * @returns {this}
     */
    #destructurePreTags() {
        for (let log of this.capturedLogs) {
            for (let key in log) {
                if (!Array.isArray(log[key])) {
                    const arr = [];
                    if (Array.isArray(log[key].pre)) log[key].pre.forEach(el => arr.push(el));
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
        return this;
    }

    /**
     * xml2js parser parses all the XML into a js object with the following structure:
     * log = {
     *      data1: ['the data 1'],
     *      data2: ['the data 2'],
     *      data3: ['the data 3']
     * }
     * Where log.data will always contain an array. That array may contain an empty string,
     * many strings, or an object with nested tags. This function destructure's the data we need
     * and flattens them into a singlur string so that log.data will be a string that can be 
     * formatted and dumped into a text file
     * @returns {this}
     */
    #flattenSubArrays() {
        this.capturedLogs = this.capturedLogs.map(log => {
            for (let key in log) {
                if (log[key].length === 1) {
                    if (log[key][0] === '') {
                        delete log[key];
                    }
                    else log[key] = log[key][0];
                    continue;
                }
                log[key] = log[key].flat().map(data => {
                    if (typeof data === 'string') return data;

                    const keys = Object.keys(data);
                    if (!Array.isArray(data) && keys.length) {
                        let arr = [];
                        for (const innerKey in data) {
                            if (innerKey !== 'style') arr.push(data[innerKey]);
                        }
                        return arr.length > 1 ? arr.join('|||') : arr[0];
                    }
                });
            }
            return log;
        });
        return this;
    }

    /**
     * xml2js parser parses the datetime stamp of the logs into a string, 
     * this just converts that to a js Date object
     * @returns {this}
     */
    #sortLogs() {
        this.capturedLogs = this.capturedLogs.map(log => {
            log.dateTime = createDate(log.dateTime, '/');
            return log;
        }).sort((a, b) => b.dateTime - a.dateTime);
        return this;
    }

    /**
     * @returns {Boolean}
     */
    #hasFilters() {
        const filters = [this.samAcctName, this.exceptionMessageKeywords].filter(prop => prop !== null);
        this.filters = filters.map(propVal => {
            const instanceInfo = Object.entries(this);
            const filterKeyValPair = instanceInfo.find(keyValPair => keyValPair[1] === propVal);
            return filterKeyValPair[0];
        });
        return this.filters.length > 0;
    }

    /**
     * 
     * @param {Object} log The log object to test against filters
     * @returns {Boolean}
     */
    #satisfiesFilters(log) {
        return this.filters.every(propertyKey => {
            switch (propertyKey) {
                case "samAcctName":
                    return log.user.some(nciName => nciName === `NCI\\${this.samAcctName}`);
                case "exceptionMessageKeywords":
                    return [log.exception, log.innerException]
                        .filter(potentialExceptionArray => potentialExceptionArray !== null && potentialExceptionArray !== undefined && potentialExceptionArray.length)
                        .some(exceptionMessageArray => this.exceptionMessageKeywords.some(
                            searchedKeyword => exceptionMessageArray.some(
                                exceptionMessage => exceptionMessage.includes(searchedKeyword)
                            )                                
                        )
                    );
            };
        });
    }
}
