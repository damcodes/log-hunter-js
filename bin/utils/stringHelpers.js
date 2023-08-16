import { ACCEPTABLE_TAGS } from "../constants.js";

export const isBlankOrNull = str => {
    return (!str || /^\s*$/.test(str));
}

export const replaceAt = (str, index, replacement) => {
    return str.substring(0, index) + replacement + str.substring(index + replacement.length);
}

export const replaceChunkAt = (str, startIdx, endIdx, replacement) => {
    for (let i = startIdx; i < endIdx; i++) {
        str = replaceAt(str, i, replacement);
    }
    return str;
}

/**
 * Determines whether a string contains HTML/XML like content
 * @param {String} str 
 * @returns {Boolean}
 */
export const isHtmlLike = (str) => {
    return /<\/?[a-z][\s\S]*>/i.test(str);
}

export const htmlToString = htmlStr => {
    let ret = htmlStr;
    const nextBracketIdx = (str, i, bracketType) => str.slice(i).indexOf(bracketType);
    for (let i = 0; i < htmlStr.length - 1; i += nextBracketIdx(ret, i, '<') >= 0 ? nextBracketIdx(ret, i, '<') : htmlStr.length - 1) {
        const currentLetter = ret[i];
        const nextLetter = ret[i+1];
        if (currentLetter === '<' || currentLetter + nextLetter === '</') {
            const nextCloseBracketIdx = nextBracketIdx(ret, i, '>');
            const tagName = ret.slice(nextLetter === '/' ? i + 2 : i + 1, i + nextCloseBracketIdx).split(' ')[0];
            const removeBracketIdx = i + nextCloseBracketIdx;
            if (ACCEPTABLE_TAGS.some(tag => tag === tagName)) {
                ret = replaceChunkAt(ret, i, removeBracketIdx + 1, ' ');
            } else {
                i++
            }
        }
    }
    return ret.split(/\s{2,}/g).reduce( (prev, next) => prev === ' ' ? next : prev + ' ' + next).trim();
}

export const insertAtStart = (targetStr, strToInsert) => strToInsert + targetStr;

export const indexFromEnd = (targetStr, searchStr) => (targetStr.length - 1) - targetStr.split('').reverse().indexOf(searchStr); 