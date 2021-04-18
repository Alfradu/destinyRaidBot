const fns = require('date-fns');
const en = require('date-fns/locale/en-GB')

const signMap = {
    '+': '-',
    '-': '+',
};

const isValidDate = (date) => date !== null && date instanceof Date && !isNaN(date);

/**
 * @param {date} date 
 * @returns {date} 
 */
const toUTC = (date) => new Date(date.toLocaleString('en-us', { timeZone: 'UTC' }));

const fixFormat = (date) => {
    const regex = /^(.*)(\+|-)(\d{2})$/g;
    const match = regex.exec(date);
    if(match === null) {
        return null;
    }
    const fixedFormat = `${match[1]}${signMap[match[2]]}${match[3]}`;
    return fixedFormat;
}

const parseLongFormat = (date) => {
    const fixedFormat = fixFormat(date);
    const parsedDate = fns.parse(fixedFormat, 'yyyyMMdd HH:mm X', new Date());
    return parsedDate;
};

const parseShortFormat = (date) => {
    const fixedFormat = fixFormat(date);

    const parseDate = fns.parse(fixedFormat, 'cccc@HH:mm X', new Date());
    const rightNow = new Date();
    return parseDate > rightNow ? parseDate : fns.addDays(utc, 7);
};

/**
 * @param {string} date 
 * @returns {date?}
 */
const parseDate = (date) => {
    const funcs = [parseLongFormat, parseShortFormat];
    for(let index = 0; index < funcs.length; index++) {
        const result = funcs[index](date);
        //console.log(result);
        if(isValidDate(result)) {
            return result;
        }
    }
    return null;
};

module.exports = parseDate;

// console.log('s', toUTC(new Date()))
// console.log(new Date())
// console.log('s', new Date().toLocaleString())

// parseDate('20200417 18:30 +00');
// parseDate('20200417 18:30 +01');
// parseDate('20200417 18:30 -01');

//parseDate('friday@18:30 +00');
// parseDate('saturday@22:55 +02');
// parseDate('saturday@22:55 +02');
// parseDate('sunday@00:01 +00');
// parseDate('sunday@18:30 +00');

//console.log(new Date().toISOString())