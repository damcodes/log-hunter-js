export const APP_NAMES = [
    "WeRequest", 
    "WeAccess", 
    "EMileage", 
    "ChromeRiver",
    "CobbleStone",
    "TWISTChk.Web", 
    "TWISTProvider", 
    "TWISTPaymentDownloadService",
    "Recoupment",
    "UltiProDownloadService",
    "Common.WebSvc",
    "PasswordReset.Web",
    "RoomSchedule",
    "HEM.Web",
    "OnBoardingAPI",

]

export const LOG_LEVELS = [
    "Error",
    "Warning"
]

export const QUERY_PARAMS = [
    {
        name: "App Name",
        type:  1,
        isDate: false,
        options: APP_NAMES,
        key: 'appName'
    },
    {
        name: "Log Severity Level",
        type: 1,
        isDate: false,
        options: LOG_LEVELS,
        key: 'logLevel'
    },
    {
        name: "Start Date",
        type: 2,
        isDate: true,
        format: "(MM-dd-YYYY HH:mm:ss)",
        key: 'startDate'
    },
    {
        name: "End Date",
        type: 2,
        isDate: true,
        format: "(MM-dd-YYYY HH:mm:ss)",
        key: 'endDate'
    },
    {
        name: "SAMAccountName",
        type: 2,
        isDate: false,
        key: 'samAcctName'
    }
]

export const QUERY_PARAM_TYPES = {
    SELECT: 1,
    INPUT: 2
}

export const ACCEPTABLE_TAGS = [
    "pre",
    "span",
    "br",
    "b",
    "p"
]


export const LOG_DIRECTORY = "\\\\nci-bis-fs01.nci.ent\\nciapps\\Logs\\CommonLogger";
// export const LOG_DIRECTORY = "/Users/dam/Development/bakerripley/sampleLogs";

export const LOGS_TO_WRITE_DIRECTORY = 'C:\\logs';