import * as fs from 'fs';
import { LOG_DIRECTORY } from './constants.js';

export class LogHunter {

    logDir = LOG_DIRECTORY;
    logs = [];
    appName = 'WeRequest';
    startDate = this.#yesterday();
    endDate = this.#now();
    logLevel = 'Error';

    /**
     * 
     * @param {String} appName - defaults to WeRequest
     * @param {Date} startDate - defaults to current datetime minus 24 hours
     * @param {Date} endDate - defaults to current datetime
     * @param {String} logLevel - log severity level, defaults to Error
     */
    constructor(appName = null, startDate = null, endDate = null, logLevel = null) {
        this.startDate = startDate || this.startDate;
        this.endDate = endDate || this.endDate;
        this.appName = appName || this.appName;
        this.logLevel = logLevel || this.logLevel;
    }

    huntLogs() {
        let allLogs = fs.readdirSync(this.logDir);
        this.logs = allLogs.filter(file => {
            let logNameParts = file.split('-');
            let [ logAppName, logLevel, logDateStr ] = logNameParts;
            let logDate = this.#parseDateString(logDateStr);
            return (
                !!this.startDate && !!this.endDate ?
                    logDate <= this.endDate && logDate >= this.startDate
                    :
                    true
            ) && (
                !!this.logLevel ?
                    logLevel === `NCI${this.logLevel}`
                    :
                    true
            ) && logAppName === this.appName;
        });
    }

    /**
     * 
     * @returns Date object for 24 hours ago
     */
    #yesterday() {
        return new Date( (new Date()).getTime() - (24 * 60 * 60 * 1000) );
    }

    /**
     * 
     * @returns Date object for right now
     */
    #now() {
        return new Date();
    }

    /**
     * Accepts date string from the datepart 
     * in our logs, parses it, and returns a Date object
     * @param {String} dateStr 
     * 
     */
    #parseDateString(dateStr) {
        const year = dateStr.slice(0, 4);
        const month = dateStr.slice(4, 6);
        const day = dateStr.slice(6, 8);
        const hour = dateStr.slice(8, 10);
        const minute = dateStr.slice(10, 12);
        const seconds = dateStr.slice(12, 14);
        return new Date(`${year}-${month}-${day} ${hour}:${minute}:${seconds}`);
    }
}