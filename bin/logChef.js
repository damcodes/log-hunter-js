import { LOGS_TO_WRITE_DIRECTORY } from "./constants.js";
import { now, formatDateStringForDirectoryName, dateToLocalTimeStr } from "./utils/dateHelpers.js";
import { existsSync, mkdirSync } from 'fs';
import { appendFile } from 'fs/promises';
import { insertAt } from "./utils/stringHelpers.js";

export class LogChef {

    logsToWrite = [];
    fileOutputType = '.txt';
    cookedAt = now();
    currentReportDirectoryName = `${formatDateStringForDirectoryName(this.cookedAt)}`;

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
        const currentReportDir = `${LOGS_TO_WRITE_DIRECTORY}\\${this.currentReportDirectoryName}`; 
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
            ${logLevel}
            ${user}
            ${hostMachine}
            ${uri}
        ` 
        : 
        `
            ${divider}
            ${timeStamp}
            ${logLevel}
            ${user}
            ${hostMachine}
        `;
        for (const key in log) {
            logStr += `
            ${(key.toUpperCase() + ':').padEnd(19)}\t\t\t${this.#formatOutputString(log[key])}
            `;
        }
        logStr += `
        ${divider}
        \n`;
        return logStr;
    }

    #formatOutputString(str) {
        const nextBreakIdx = (s, start, word = ' at ', regex = /\s*\bat\b\s/g) => {
            return regex.test(s.slice(start+1)) && s.slice(start+1).indexOf(word) >= 0 ? 
                s.slice(start+1).indexOf(word) + 1 : -1;
        }
        const arr = [];
        let startIdx = 0;
        let endIdx = nextBreakIdx(str, startIdx);
        while (endIdx >= 0) {
            let segment = str.slice(startIdx, endIdx).trim();
            if (segment.includes(' in ')) {
                const inSegmentIdx = segment.indexOf(' in ');
                segment = insertAt(segment, inSegmentIdx, '\n\t\t\t\t\t\t\t');
            }
            arr.push(segment);
            startIdx = endIdx;
            endIdx += nextBreakIdx(str, startIdx) !== -1 ? nextBreakIdx(str, startIdx) : -endIdx - 2 ;
        }

        let finalSegment = str.slice(startIdx).trim();
        if (finalSegment.includes(' in ')) {
            const inSegmentIdx = finalSegment.indexOf(' in ');
            finalSegment = insertAt(finalSegment, inSegmentIdx, '\n\t\t\t\t\t\t\t');
        }
        arr.push(finalSegment);
        return arr.length ? arr.join('\n\t\t\t\t\t\t') : str;
    }
}