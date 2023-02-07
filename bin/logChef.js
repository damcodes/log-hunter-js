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
        if (!existsSync(LOGS_TO_WRITE_DIRECTORY)) mkdirSync(LOGS_TO_WRITE_DIRECTORY);
        if (!existsSync(`${LOGS_TO_WRITE_DIRECTORY}\\${this.mainDirectory}`)) mkdirSync(`${LOGS_TO_WRITE_DIRECTORY}\\${this.mainDirectory}`);
        let dates = this.logsToWrite.map(log => log.dateTime.toLocaleDateString());
        let directories = Array.from(new Set(dates));
        console.log(`For dates:`);
        console.log(directories);
    }
}