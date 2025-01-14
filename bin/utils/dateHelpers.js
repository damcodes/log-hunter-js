/**
 * Accepts date string in format MM-dd-YYYY HH:mm:ss and returns a new Date object
 * @param {String} dateTimeInputStr 
 * @param {String} dateSeparator - The delimiter for splitting the date part (/ vs -),
 * depends on the format of dateTimeInputStr
 * @param {String} dateTimeSeparator - The delimiter for splitting date and time, depends on
 * the format of dateTimeInputStr
 * @returns {Date}
 */
export const createDate = (dateTimeInputStr, dateSeparator = '-', dateTimeSeparator = ' ') => {
    const dateTimeSplit = dateTimeInputStr.split(dateTimeSeparator);
    const datePart = dateTimeSplit[0];
    const [ month, day, year ] = datePart.split(dateSeparator).map( val => parseInt(val));
    
    const timePart = dateTimeSplit[1] || null;
    if (!timePart) return new Date(year, month - 1, day, 0, 0, 0);
    let [ hour, minute, seconds ] = timePart.split(':').map( val => parseInt(val));

    const amOrPm = dateTimeSplit[2] || null;
    if (amOrPm && amOrPm === "PM" && hour < 12) hour += 12;
    return new Date(year, month - 1, day, hour, minute || 0, seconds || 0);
}

/**
 * 
 * @param {Date} date 
 * @returns {Date} Date object for 12:00 AM of day before date
 */
export const beginningOfYesterday = date => {
    const day = date.getDate() - 1;
    const month = date.getMonth();
    const year = date.getFullYear();
    return new Date(year, month, day, 0, 0, 0);
}

/**
 * 
 * @returns Date object for right now
 */
export const now = () => new Date();

/**
 * 
 * @param {Date} date 
 * @returns {String} format: MM/dd/YYYY HH:mm:ss
 */
export const localDateTime = date => `${date.toLocaleDateString() + ' ' + date.toLocaleTimeString()}`;

/**
 * 
 * @param {Date} date 
 * @returns {String} format: YYYY-MM-ddTHHmmss
 */
export const formatDateStringForDirectoryName = (date, dateOnly = false) => {
    const [ month, day, year] = date.toLocaleDateString().split('/');
    let datePartStr = `${year}-${month.length < 2 ? '0'+month : month}-${day.length < 2 ? '0'+day : day}`
    if (dateOnly) return datePartStr;
    const timePartStr = date.toTimeString().split(' ')[0].split(':').join('.');
    return `${datePartStr}T${timePartStr}`;
}

/**
 * 
 * @param {String} dateStr - format: YYYYMMdd
 * @returns {Date} new Date object
 */
export const createDateFromFileName = dateStr => {
    const year = parseInt(dateStr.slice(0,4));
    const month = parseInt(dateStr.slice(4,6)) - 1;
    const day = parseInt(dateStr.slice(6,8));
    return new Date(year, month, day);
}

/**
 * 
 * @param {Date} date 
 * @returns {String} format: HH:MM:ss (AM/PM)
 */
export const dateToLocalTimeStr = date => {
    const hours = date.getHours();
    const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
    const seconds = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
    return hours >= 12 ? `${hours === 12 ? hours : hours-12}:${minutes}:${seconds} PM` 
            : 
            `${hours === 0 ? '12' : hours}:${minutes}:${seconds} AM`;
}