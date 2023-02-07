/**
 * Parses string from input format to MM-dd-YYYY HH:mm:ss
 * @param {String} str input format: YYYYMMddHHmmSSss (202302031014273)
 * @returns {String}
 */
export const formatFileNameDateString = str => {
    const year = str.slice(0, 4);
    const month = str.slice(4, 6);
    const day = str.slice(6, 8);
    const hour = str.slice(8, 10);
    const minute = str.slice(10, 12);
    const seconds = str.slice(12, 14);
    return `${month}-${day}-${year} ${hour}:${minute}:${seconds}`;
} 

/**
 * Accepts date string in format MM-dd-YYYY HH:mm:ss and returns a new Date object
 * @param {String} dateTimeInputStr 
 * @param {String} dateSeparator - The delimiter for splitting the date part (/ vs -)
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
     * @returns Date object for 24 hours ago
     */
export const yesterday = () => {
    return new Date( (new Date()).getTime() - (24 * 60 * 60 * 1000) );
}

/**
 * 
 * @returns Date object for right now
 */
export const now = () => {
    return new Date();
}

export const localDateTime = (date) => {
    return `${date.toLocaleDateString() + ' ' + date.toLocaleTimeString()}`
}

export const formatDateStringForFileName = (date) => {
    let datePart = date.toISOString().split('T')[0];
    let timePart = date.toTimeString();
    return `${datePart}T${timePart.slice(0,2) + timePart.slice(3,5) + timePart.slice(6,8)}`
}