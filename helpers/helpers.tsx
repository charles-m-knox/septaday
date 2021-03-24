export const wait = (timeout: number) => {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
};

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