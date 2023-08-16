export const LOG_DIRECTORY = "\\\\nci-bis-fs01.nci.ent\\nciapps\\Logs\\CommonLogger";
export const LOGS_TO_WRITE_DIRECTORY = 'C:\\hunter';

export const APP_NAMES = [
    "WeRequest", 
    "WeAccess", 
    "WeAccessService",
    "EMileage", 
    "ChromeRiver",
    "ChasePaymentUploadService",
    "CobbleStone",
    "TWISTChk.Web", 
    "TWISTProvider", 
    "TWISTPaymentDownloadService",
    "TWISTScripts",
    "Recoupment",
    "RoomSchedule",
    "UltiProDownloadService",
    "Common.WebSvc",
    "PasswordReset.Web",
    "RoomSchedule",
    "HEM.Web",
    "OnBoardingAPI",
]

export const LOG_LEVELS = [
    "Error",
    "Warning",
    "Information"
]

export const QUERY_PARAM_TYPES = {
    SELECT: 1,
    INPUT: 2
}

export const QUERY_PARAMS = [
    {
        name: "App Name",
        type:  QUERY_PARAM_TYPES.SELECT,
        isDate: false,
        options: APP_NAMES,
        key: 'appName'
    },
    {
        name: "Log Severity Level",
        type: QUERY_PARAM_TYPES.SELECT,
        isDate: false,
        options: LOG_LEVELS,
        key: 'logLevel'
    },
    {
        name: "Start Date",
        type: QUERY_PARAM_TYPES.INPUT,
        isDate: true,
        format: "(M-d-YYYY HH:mm:ss)",
        key: 'startDate'
    },
    {
        name: "End Date",
        type: QUERY_PARAM_TYPES.INPUT,
        isDate: true,
        format: "(M-d-YYYY HH:mm:ss)",
        key: 'endDate'
    },
    {
        name: "SAMAccountName",
        type: QUERY_PARAM_TYPES.INPUT,
        isDate: false,
        key: 'samAcctName'
    },
    {
        name: 'Exception Keywords',
        type: QUERY_PARAM_TYPES.INPUT,
        isDate: false,
        isArray: true,
        key: 'exceptionMessageKeywords'
    },
    {
        name: 'Stack Trace Keywords',
        type: QUERY_PARAM_TYPES.INPUT,
        isDate: false,
        isArray: true,
        key: 'stackTraceKeywords'
    }
]

export const ACCEPTABLE_TAGS = [
    "pre",
    "span",
    "br",
    "b",
    "p",
    "head",
    "meta",
    "html",
    "title",
    "div",
    "h1",
    "h2",
    "h3",
    "body",
    "style",
    "!DOCTYPE",
    "!--",
    "fieldset",
    "center"
]
