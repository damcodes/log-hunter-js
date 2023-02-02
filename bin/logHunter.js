import * as fs from 'fs';

export class LogHunter {

    /*
        LogLevels: 
            - NCIWarning
            - NCIError
    */

    /**
     * 
     * @param {String} logDir - absolute path to log directory
     * @param {String} appName - defaults to WeRequest
     * @param {Date} startDate - defaults to current datetime minus 24 hours
     * @param {Date} endDate - defaults to current datetime
     * @param {String} logLevel - log severity level
     */
    constructor(logDir, appName = 'WeRequest', startDate = null, endDate = null, logLevel = "Error") {
        this.logDir = logDir;
        this.endDate = endDate || new Date();
        this.startDate = startDate || yesterday(this.endDate);
        this.appName = appName;
        this.logLevel = `NCI${logLevel}`;
    }

    huntLogs() {
        let logs = fs.readdirSync(this.logDir);
        return logs.filter(file => {
            let logNameParts = file.split('-');
            let [ logAppName, logLevel, logDateStr ] = logNameParts;
            let logDate = parseDateString(logDateStr);
            return (
                !!this.startDate && !!this.endDate ?
                    logDate <= this.endDate && logDate >= this.startDate
                    :
                    true
            ) && (
                !!this.logLevel ?
                    logLevel === this.logLevel
                    :
                    true
            ) && logAppName === this.appName;
        });
    }
}


/**
 * Accepts date string from the datepart 
 * in our logs, parses it, and returns a Date object
 * @param {String} dateStr 
 * 
 */
function parseDateString(dateStr) {
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    const hour = dateStr.slice(8, 10);
    const minute = dateStr.slice(10, 12);
    const seconds = dateStr.slice(12, 14);
    return new Date(`${year}-${month}-${day} ${hour}:${minute}:${seconds}`);
}

function yesterday(date) {
    return new Date(date.getTime() - (24 * 60 * 60 * 1000) );
}