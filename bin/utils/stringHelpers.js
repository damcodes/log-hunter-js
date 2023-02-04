import { ACCEPTABLE_TAGS } from "../constants.js";

export const isBlankOrNull = str => {
    return (!str || /^\s*$/.test(str));
}

export const replaceAt = (str, index, replacement) => {
    return str.substring(0, index) + replacement + str.substring(index + replacement.length);
}

export const removeInvalidTagBrackets = (xmlString) => {
    let ret = xmlString;
    for (let i = 0; i < xmlString.length - 1; i++) {
        const currentLetter = xmlString[i];
        const nextLetter = xmlString[i+1];

        if (currentLetter === '<' && nextLetter !== "/") {
            const nextBracketIdx = xmlString.slice(i).indexOf('>');
            const tagName = ret.slice(i + 1, i + nextBracketIdx);
            if (!ACCEPTABLE_TAGS.some(tag => tagName.includes(tag))) {
                const removeBracketIdx = i + nextBracketIdx;
                ret = replaceAt(ret, i, ' ');
                ret = replaceAt(ret, removeBracketIdx, ' ');
            }
        }
    }
    return ret;
}

export const isHtmlLike = (str) => {
    return /<\/?[a-z][\s\S]*>/i.test(str);
}

export const formatAmpersands = (str) => {
    let ret = str;
    let ampersandIdx = str.indexOf('&');
    while (ampersandIdx !== -1) {
        ret = replaceAt(ret, ampersandIdx, '&amp;');
        ampersandIdx = str.indexOf('&');
    }
    return ret;
}