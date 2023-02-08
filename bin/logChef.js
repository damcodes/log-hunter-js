import { LOGS_TO_WRITE_DIRECTORY } from "./constants.js";
import { now, formatDateStringForDirectoryName, dateToLocalTimeStr } from "./utils/dateHelpers.js";
import { existsSync, mkdirSync } from 'fs';
import { appendFile } from 'fs/promises';

export class LogChef {

    logsToWrite = [];
    fileOutputType = '.txt';
    cookedAt = now();
    #currentReportDirectoryName = `hunter_${formatDateStringForDirectoryName(this.cookedAt)}`;

    constructor(logsToWrite, fileOutputType = null) {
        this.logsToWrite = logsToWrite;
        this.fileOutputType = fileOutputType || this.fileOutputType;
    }

    async cookLogs() {
        if (!existsSync(LOGS_TO_WRITE_DIRECTORY)) mkdirSync(LOGS_TO_WRITE_DIRECTORY);
        await this.#createRequiredDirectories();
        
    }

    /**
     * 
     */
    async #createRequiredDirectories() {
        const currentReportDir = `${LOGS_TO_WRITE_DIRECTORY}\\${this.#currentReportDirectoryName}`; 
        if (!existsSync(currentReportDir)) mkdirSync(currentReportDir);

        const logDates = this.logsToWrite.map(log => formatDateStringForDirectoryName(log.dateTime, true));
        const directoryNamesToCreate = Array.from(new Set(logDates));
        for (const dirName of directoryNamesToCreate) {
            if (!existsSync(`${currentReportDir}\\${dirName}`)) mkdirSync(`${currentReportDir}\\${dirName}`);
            const logsForThisDir = this.logsToWrite.filter( log => dirName === formatDateStringForDirectoryName(log.dateTime, true));
            const logsByApp = {};
            for (const log of logsForThisDir) {
                if (logsByApp[log.app]) logsByApp[log.app].push(log);
                else logsByApp[log.app] = [ log ];
            }
            for (const [appName, logs] of Object.entries(logsByApp)) {
                const newFilePath = `${currentReportDir}\\${dirName}\\${appName}${this.fileOutputType}`;
                await appendFile(newFilePath, `${appName}\n\n`);
                for (const log of logs) {
                    await appendFile(newFilePath, this.#formattedLogString(log));
                }
            }
        }
    }

    #formattedLogString(log) {
        const divider = '------------------------------------------------------------------------------------------------------------------'
        const timeStamp = `${'Time:'.padEnd(19)}\t\t\t${dateToLocalTimeStr(log.dateTime)}`;
        const logLevel = `${'Log Severity Level:'.padEnd(19)}\t\t\t${log.logType}`;
        const user = `${'SAMAccountName:'.padEnd(19)}\t\t\t${log.user}`;
        const hostMachine = `${'Host Machine:'.padEnd(19)}\t\t\t${log.hostMachine}`;
        // const ip = !!log.ip ? `${'IP:'.padEnd(19)}\t\t\t${log.ip}` : null;
        const uri = !!log.uri ? `${'URI:'.padEnd(19)}\t\t\t${log.uri}` : null;
        const logStr = !!uri ? 
        `
            ${divider}
            ${timeStamp}
            ${logLevel}
            ${user}
            ${hostMachine}
            ${uri}
            ${divider}\n
        ` 
        : 
        `
            ${divider}
            ${timeStamp}
            ${logLevel}
            ${user}
            ${hostMachine}
            ${divider}\n
        `;
        return logStr;
    }
}