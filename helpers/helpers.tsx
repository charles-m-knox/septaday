export const wait = (timeout: number) => {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
};

// https://stackoverflow.com/a/61505926/3798673
export const getDateFromInt = (dateInt: number): Date => {
    const d = new Date(0);
    d.setUTCSeconds(dateInt);
    return d;
    // const tzDiff = new Date(1970, 0, 1).getTime()
    // return (new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - tzDiff) / 1000;
}

export const getOffsetDaysFromInt = (dateInt: number, days: number): number => {
    const d = new Date(0);
    d.setUTCSeconds(dateInt);
    d.setDate(d.getDate() + days);
    const tzDiff = new Date(1970, 0, 1).getTime();
    return (new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - tzDiff) / 1000;
}

export const getHumanDate = (date: number) => {
    const d = new Date(0);
    // const tzDiff = new Date(1970, 0, 1).getTime();
    d.setUTCSeconds(date);
    // const d = new Date(date);
    // return (new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - tzDiff) / 1000;
    let day = '';
    switch (d.getUTCDay()) {
        case 0:
            day = 'Sunday';
            break;
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
    return `${day}, ${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`;
}

export const getSimpleDate = (date: number) => {
    const d = new Date(0);
    // const tzDiff = new Date(1970, 0, 1).getTime();
    d.setUTCSeconds(date);
    // return `${day}, ${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`;
    return d.toLocaleDateString();
}