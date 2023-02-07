import { LOGS_TO_WRITE_DIRECTORY } from "./constants.js";
import { now, formatDateStringForFileName } from "./utils/dateHelpers.js";
import { existsSync, mkdirSync } from 'fs';

export class LogChef {

    logsToWrite = [];
    fileType = '.txt';
    cookedAt = now();
    mainDirectory = `hunter_report_${formatDateStringForFileName(this.cookedAt)}`;

    constructor(logsToWrite, fileType = null) {
        this.logsToWrite = logsToWrite;
        this.fileType = fileType || this.fileType;
    }

    cookLogs() {
        this.#createRequiredDirectories();
        
    }

    #createRequiredDirectories() {
        if (!existsSync(LOGS_TO_WRITE_DIRECTORY)) mkdirSync(LOGS_TO_WRITE_DIRECTORY);
        // const currentReportDir = `${LOGS_TO_WRITE_DIRECTORY}\\${this.mainDirectory}`; //windows
        // if (!existsSync(`${LOGS_TO_WRITE_DIRECTORY}\\${this.mainDirectory}`)) mkdirSync(`${LOGS_TO_WRITE_DIRECTORY}\\${this.mainDirectory}`); //windows
        const currentReportDir = `${LOGS_TO_WRITE_DIRECTORY}/${this.mainDirectory}`; //mac
        if (!existsSync(currentReportDir)) mkdirSync(currentReportDir); //mac
        let dates = this.logsToWrite.map(log => formatDateStringForFileName(log.dateTime, true));
        let directories = Array.from(new Set(dates));
        directories.forEach( dirName => {
            // if (!existsSync(`${currentReportDir}\\${dirName}`)) mkdirSync(`${currentReportDir}\\${dirName}`); //windows
            if (!existsSync(`${currentReportDir}/${dirName}`)) mkdirSync(`${currentReportDir}/${dirName}`); //mac
        });
    }
}