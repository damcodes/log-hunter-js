import { LOGS_TO_WRITE_DIRECTORY } from "./constants.js";
import { now, formatDateStringForDirectoryName, dateToLocalTimeStr } from "./utils/dateHelpers.js";
import { existsSync, mkdirSync } from 'fs';
import { appendFile } from 'fs/promises';
import { insertAt } from "./utils/stringHelpers.js";

export class LogChef {

    logsToWrite = [];
    fileOutputType = '.txt';
    currentReportDirectoryName = `${formatDateStringForDirectoryName(now())}`;
    cookingErrors = [];

    constructor(logsToWrite, fileOutputType = null) {
        this.logsToWrite = logsToWrite;
        this.fileOutputType = fileOutputType || this.fileOutputType;
    }

    async cookLogs() {
        if (!existsSync(LOGS_TO_WRITE_DIRECTORY)) mkdirSync(LOGS_TO_WRITE_DIRECTORY);
        const currentReportDirPath = `${LOGS_TO_WRITE_DIRECTORY}\\${this.currentReportDirectoryName}`;
        const createdDirectoryNames = this.#createRequiredDirectories(currentReportDirPath);
        for (const dirName of createdDirectoryNames) {
            const logsByDirAndApp = this.#groupLogsByDirectoryAndApp(dirName);
            for (const [appName, logs] of Object.entries(logsByDirAndApp)) {
                const newFilePath = `${currentReportDirPath}\\${dirName}\\${appName}${this.fileOutputType}`;
                await appendFile(newFilePath, `${appName}\n\n`);
                for (const log of logs) {
                    try {
                        await appendFile(newFilePath, this.#generateLogDataText(log));
                    } catch(e) {
                        let logCookingError = this.cookingErrors.find(logError => logError.logFileName === log.logFileName);
                        if (logCookingError) {
                            logCookingError.errors.push(e.message);
                        } else {
                            this.cookingErrors.push({ errors: [e.message], logFileName: log.logFileName });
                        }
                    }
                }
            }
        }
    }

    /**
     * If currentReportPath directory doesn't exist, creates it. Then,
     * gets the dates for all the logs to be written and creates a directory
     * for that date.
     * @param {String} currentReportPath 
     * @returns {String[]} List of created directory names
     */
    #createRequiredDirectories(currentReportPath) {
        if (!existsSync(currentReportPath)) mkdirSync(currentReportPath);
        const logDates = this.logsToWrite.map(log => formatDateStringForDirectoryName(log.dateTime, true));
        const directoryNamesToCreate = Array.from(new Set(logDates));
        for (const dirName of directoryNamesToCreate) {
            if (!existsSync(`${currentReportPath}\\${dirName}`)) mkdirSync(`${currentReportPath}\\${dirName}`);
        }
        return directoryNamesToCreate;
    }

    /**
     * 
     * @param {String} dirName Format: YYYY-MM-dd
     * @returns {Object} Object containing log objects grouped by app name and 
     * directory name (date)
     */
    #groupLogsByDirectoryAndApp(dirName) {
        const logsForThisDir = this.logsToWrite.filter( log => dirName === formatDateStringForDirectoryName(log.dateTime, true));
        const logsByApp = {};
        for (const log of logsForThisDir) {
            if (logsByApp[log.app]) logsByApp[log.app].push(log);
            else logsByApp[log.app] = [ log ];
        }
        return logsByApp;
    }

    /**
     * Accepts a log object and generates the string that
     * will be written to the text file.
     * @param {Object} log 
     * @returns {String}
     */
    #generateLogDataText(log) {
        const idx = this.logsToWrite.findIndex(log => log === log);
        this.logsToWrite.splice(idx, 1);
        delete log.app;
        if (log.ip) delete log.ip;
        const divider = `
            ${'-'.padEnd(200, '-')} 
            ${'-'.padEnd(200, '-')}
        `;
        const timeStamp = `${'Time:'.padEnd(19)}\t\t\t${dateToLocalTimeStr(log.dateTime)}`;
        delete log.dateTime;
        const logLevel = `${'Log Severity Level:'.padEnd(19)}\t\t\t${log.logType}`;
        delete log.logType;
        const originalLogFile = `${'Original Log File:'.padEnd(19)}\t\t\t${log.logFileName}`;
        const user = `${'SAMAccountName:'.padEnd(19)}\t\t\t${log.user}`;
        delete log.user;
        const hostMachine = `${'Host Machine:'.padEnd(19)}\t\t\t${log.hostMachine}`;
        delete log.hostMachine;
        const uri = !!log.uri ? `${'URI:'.padEnd(19)}\t\t\t${log.uri}` : null;
        if (uri) delete log.uri;
        let logStr = !!uri ? 
        `
            ${divider}
            ${timeStamp}
            ${originalLogFile}
            ${logLevel}
            ${user}
            ${hostMachine}
            ${uri}
        ` 
        : 
        `
            ${divider}
            ${timeStamp}
            ${originalLogFile}
            ${logLevel}
            ${user}
            ${hostMachine}
        `;
        for (const key in log) {
            if (key !== 'logFileName') logStr += `
            ${(key.toUpperCase() + ':').padEnd(19)}\t\t\t${this.#formatOutputString(log[key])}
            `;
        }
        logStr += `
        ${divider}
        \n`;
        return logStr;
    }

    /**
     * Generates string to be output to text file for log fields that 
     * hold error information (exception, innerException, message, stackTrace). 
     * Formats the string on the 'at's and 'in's 
     * @param {String} str 
     * @returns {String}
     */
    #formatOutputString(str) {
        const nextBreakIdx = (s, startIdx, word = ' at ', regex = /\s*\bat\b\s/g) => {
            return regex.test(s.slice(startIdx+1)) && s.slice(startIdx+1).indexOf(word) >= 0 ? 
                s.slice(startIdx+1).indexOf(word) + 1 : -1;
        }
        const arr = [];
        let startIdx = 0;
        let endIdx = nextBreakIdx(str, startIdx);
        while (endIdx >= 0) {
            let segment = str.slice(startIdx, endIdx).trim();
            if (segment.includes(' in C:')) {
                const inSegmentIdx = segment.indexOf(' in C:');
                segment = insertAt(segment, inSegmentIdx, '\n\t\t\t\t\t\t\t');
            }
            arr.push(segment);
            startIdx = endIdx;
            endIdx += nextBreakIdx(str, startIdx) !== -1 ? nextBreakIdx(str, startIdx) : -endIdx - 2 ;
        }
        let finalSegment = str.slice(startIdx).trim();
        if (finalSegment.includes(' in C:')) {
            const inSegmentIdx = finalSegment.indexOf(' in C:');
            finalSegment = insertAt(finalSegment, inSegmentIdx, '\n\t\t\t\t\t\t\t');
        }
        arr.push(finalSegment);
        return arr.length ? arr.join('\n\t\t\t\t\t\t') : str;
    }
}