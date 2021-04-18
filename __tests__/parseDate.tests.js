const fns = require('date-fns');
const dateParser = require('../src/dateParser.js');

describe("parse date", () => {
    describe("long format", () => {
        test('no offset', () => {
            const parseDate = dateParser('20210417 18:30 +00');
            const date = new Date(Date.parse('2021-04-17T18:30:00Z'));
            expect(parseDate.getDate()).toBe(date.getDate());
            expect(parseDate.getTime()).toBe(date.getTime());
            expect(parseDate.getTimezoneOffset()).toBe(date.getTimezoneOffset());
        });
        test('positive offset', () => {
            const parseDate = dateParser('20210417 18:30 +02');
            const date = new Date(Date.parse('2021-04-17T20:30:00Z'));
            expect(parseDate.getDate()).toBe(date.getDate());
            expect(parseDate.getTime()).toBe(date.getTime());
            expect(parseDate.getTimezoneOffset()).toBe(date.getTimezoneOffset());
        });
        test('negative offset', () => {
            const parseDate = dateParser('20210417 18:30 -02');
            const date = new Date(Date.parse('2021-04-17T16:30:00Z'));
            expect(parseDate.getDate()).toBe(date.getDate());
            expect(parseDate.getTime()).toBe(date.getTime());
            expect(parseDate.getTimezoneOffset()).toBe(date.getTimezoneOffset());
        });
    });
    describe("short format", () => {
        test('no offset', () => {
            const parseDate = dateParser('friday@18:30 +00');
            const utcNow = new Date();
            const d = `${utcNow.getUTCFullYear()}-${(utcNow.getUTCMonth() + 1).toString().padStart(2, '0')}-${utcNow.getUTCDate().toString().padStart(2, '0')}T18:30Z`;
            const date  = new Date(Date.parse(d));
            const day = date.getDay();
            const friday = 5;
            const nextFriday = fns.addDays(date, Math.abs(day - friday));
            const parseDate1 = parseDate > utcNow ? parseDate : fns.addDays(utc, 7);
            expect(parseDate1.getDate()).toBe(nextFriday.getDate());
            expect(parseDate1.getTime()).toBe(nextFriday.getTime());
            expect(parseDate1.getTimezoneOffset()).toBe(nextFriday.getTimezoneOffset());
        });
    });
});