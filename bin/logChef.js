import { LOGS_TO_WRITE_DIRECTORY } from "./constants.js";
import { now, formatDateStringForDirectoryName } from "./utils/dateHelpers.js";
import { existsSync, mkdirSync } from 'fs';

export class LogChef {

    logsToWrite = [];
    fileOutputType = '.txt';
    cookedAt = now();
    #currentReportDirectoryName = `hunter_${formatDateStringForDirectoryName(this.cookedAt)}`;

    constructor(logsToWrite, fileOutputType = null) {
        this.logsToWrite = logsToWrite;
        this.fileOutputType = fileOutputType || this.fileOutputType;
    }

    cookLogs() {
        if (!existsSync(LOGS_TO_WRITE_DIRECTORY)) mkdirSync(LOGS_TO_WRITE_DIRECTORY);
        this.#createRequiredDirectories();
        
    }

    /**
     * 
     */
    #createRequiredDirectories() {
        const currentReportDir = `${LOGS_TO_WRITE_DIRECTORY}\\${this.#currentReportDirectoryName}`; 
        if (!existsSync(currentReportDir)) mkdirSync(currentReportDir);

        const logDates = this.logsToWrite.map(log => formatDateStringForDirectoryName(log.dateTime, true));
        const directoryNamesToCreate = Array.from(new Set(logDates));
        const logsGroupedByDate = {};
        directoryNamesToCreate.forEach( dirName => {
            if (!existsSync(`${currentReportDir}\\${dirName}`)) mkdirSync(`${currentReportDir}\\${dirName}`);
            logsGroupedByDate[dirName] = this.logsToWrite.filter( log => dirName === formatDateStringForDirectoryName(log.dateTime, true));
        });
    }
}