export const wait = (timeout: number) => {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
};

/**
 * getDateInt is essential - it returns today as a Unix seconds timestamp,
 * starting from 00:00 UTC, **regardless of timezone**. This is important,
 * as it establishes a single source of truth for each task entry.
 * https://stackoverflow.com/a/61505926/3798673
 * https://date-fns.org/v2.19.0/docs/Time-Zones
 *
 * @returns {number} UTC seconds date value
 */
export const getDateInt = (forDate?: Date): number => {
    const today = forDate ? forDate : new Date();
    const tzDiff = new Date(1970, 0, 1).getTime();
    return (
        new Date(today.getFullYear(),
            today.getMonth(),
            today.getDate(),
        ).getTime() - tzDiff) / 1000;

}

/**
 * `getOffsetDaysFromInt` adds or subtracts a number of days into the future
 * (or past) and returns the UTC timestamp at 00:00 for that date, regardless
 * of the current timezone.
 * https://stackoverflow.com/a/61505926/3798673
 *
 * @param {number} [dateInt=0] The date to start from. UTC seconds.
 * @param {number} [days=0] The number of days to increment, can be negative. If zero, it returns today.
 * @return {*}  {number} UTC seconds date value
 */
export const getOffsetDaysFromInt = (dateInt: number, days: number = 0): number => {
    const d = new Date(0);
    d.setUTCSeconds(dateInt);
    d.setDate(d.getDate() + days + 1);
    const tzDiff = new Date(1970, 0, 1).getTime();
    return (
        new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate()
        ).getTime() - tzDiff
    ) / 1000;
}

/**
 * `getHumanDate` returns a human-readable date. This value must take an input
 * UTC timestamp, preferably one straight from `getDateInt()`.
 *
 * @param {number} date The UTC seconds timestamp to print
 * @returns {string} A value such as 'Wednesday, 3/31/2021'
 */
export const getHumanDate = (date: number, includeWeekday: boolean = true): string => {
    const d = new Date(0);
    d.setUTCSeconds(date);
    const hdate = `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`;
    if (!includeWeekday) {
        return hdate;
    }
    let day = '';
    switch (d.getUTCDay()) {
        case 1:
            day = 'Monday';
            break;
        case 2:
            day = 'Tuesday';
            break;
        case 3:
            day = 'Wednesday';
            break;
        case 4:
            day = 'Thursday';
            break;
        case 5:
            day = 'Friday';
            break;
        case 6:
            day = 'Saturday';
            break;
        default:
            day = 'Sunday';
            break;
    }
    return `${day}, ${hdate}`;
}
