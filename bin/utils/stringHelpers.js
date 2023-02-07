import { ACCEPTABLE_TAGS } from "../constants.js";

export const isBlankOrNull = str => {
    return (!str || /^\s*$/.test(str));
}

export const replaceAt = (str, index, replacement) => {
    return str.substring(0, index) + replacement + str.substring(index + replacement.length);
}

/**
 * Removes <> brackets from non-html tags in our logs so that it can be properly parsed
 * @param {String} xmlString 
 * @returns {String}
 */
export const removeInvalidTagBrackets = (xmlString) => {
    let ret = xmlString;
    for (let i = 0; i < xmlString.length - 1; i++) {
        const currentLetter = xmlString[i];
        const nextLetter = xmlString[i+1];

        if (currentLetter === '<' && nextLetter !== "/") {
            const nextBracketIdx = xmlString.slice(i).indexOf('>');
            const tagName = ret.slice(i + 1, i + nextBracketIdx).split(' ')[0];
            if (!ACCEPTABLE_TAGS.some(tag => tagName === tag)) {
                const removeBracketIdx = i + nextBracketIdx;
                ret = replaceAt(ret, i, ' ');
                ret = replaceAt(ret, removeBracketIdx, ' ');
                i = removeBracketIdx;
            }
        }
        if (xmlString.slice(i+1).indexOf('<') >= 0) i += xmlString.slice(i+1).indexOf('<');
    }
    return ret;
}

/**
 * Determines whether a string contains HTML/XML like content
 * @param {String} str 
 * @returns {Boolean}
 */
export const isHtmlLike = (str) => {
    return /<\/?[a-z][\s\S]*>/i.test(str);
}

/**
 * Replaces ampersands in an XML string so that it can be parsed properly
 * @param {String} str 
 * @returns {String}
 */
export const formatAmpersands = (str) => {
    let ret = str;
    let ampersandIdx = str.indexOf('&');
    while (ampersandIdx !== -1) {
        ret = replaceAt(ret, ampersandIdx, '-');
        ampersandIdx = ret.indexOf('&');
    }
    return ret;
}