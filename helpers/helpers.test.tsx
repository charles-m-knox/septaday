import { getDate } from 'date-fns';
import * as helpers from './helpers';

// https://jestjs.io/docs/timer-mocks
jest.useFakeTimers();
test("wait should wait N number of seconds before returning", () => {
    helpers.wait(1000);
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
});

test("getDateInt should return the UTC seconds value of a given current date", () => {
    const today = new Date();
    const tzDiff = new Date(1970, 0, 1).getTime();
    interface Test {
        input: Date | undefined;
        output: number;
    }
    const testTable: Test[] = [
        {
            input: new Date(2021, 2, 20, 9, 30, 0, 0),
            output: 1616198400,
        },
        {
            input: new Date(2021, 2, 20, 22, 30, 0, 0),
            output: 1616198400,
        },
        {
            input: new Date(2021, 2, 20, 23, 59, 0, 0),
            output: 1616198400,
        },
        {
            input: new Date(2021, 2, 20, 0, 0, 0, 0),
            output: 1616198400,
        },
        {
            input: undefined,
            output: (new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() - tzDiff) / 1000,
        }
    ];
    testTable.forEach((test: Test) => {
        expect(helpers.getDateInt(test.input)).toEqual(test.output);
    })
});

test("getOffsetDaysFromInt should return the correct dates", () => {
    const today = new Date();
    const tzDiff = new Date(1970, 0, 1).getTime();
    interface Test {
        input: number;
        inputDaysOffset: number | undefined;
        output: number;
    }
    const testTable: Test[] = [
        {
            input: 1616198400, // new Date(2021, 2, 20, 9, 30, 0, 0),
            inputDaysOffset: 1,
            output: 1616284800,
        },
        {
            input: 1616198400, // new Date(2021, 2, 20, 9, 30, 0, 0),
            inputDaysOffset: 2,
            output: 1616371200,
        },
        {
            input: 1616198400, // new Date(2021, 2, 20, 9, 30, 0, 0),
            inputDaysOffset: 0,
            output: 1616198400,
        },
        {
            input: 1616198400, // new Date(2021, 2, 20, 9, 30, 0, 0),
            inputDaysOffset: -1,
            output: 1616112000,
        },
        {
            input: 1616198400, // new Date(2021, 2, 20, 9, 30, 0, 0),
            inputDaysOffset: -2,
            output: 1616025600,
        },
        {
            input: (new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() - tzDiff) / 1000, // for today,
            inputDaysOffset: undefined,
            output: (new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() - tzDiff) / 1000,
        },
    ];
    testTable.forEach((test: Test) => {
        expect(helpers.getOffsetDaysFromInt(test.input, test.inputDaysOffset)).toEqual(test.output);
    })
});

test("getHumanDate should return a human-readable date", () => {
    interface Test {
        input: number;
        inputIncludeWeekday: boolean | undefined;
        output: string;
    }
    const testTable: Test[] = [
        {
            input: 1616198400, // new Date(2021, 2, 20, 0, 0, 0, 0),
            inputIncludeWeekday: true,
            output: "Saturday, 3/20/2021",
        },
        {
            input: 1616198400, // new Date(2021, 2, 20, 0, 0, 0, 0),
            inputIncludeWeekday: false,
            output: "3/20/2021",
        },
        {
            input: 1615507200, // new Date(2021, 2, 12, 0, 0, 0, 0),
            inputIncludeWeekday: undefined,
            output: "Friday, 3/12/2021",
        },
        {
            input: 1615507200, // new Date(2021, 2, 12, 0, 0, 0, 0),
            inputIncludeWeekday: false,
            output: "3/12/2021",
        },
        {
            input: 1617193823, // new Date(2021, 2, 31, 12, 30, 23, 0),
            inputIncludeWeekday: true,
            output: "Wednesday, 3/31/2021",
        },
        {
            input: 1617193823, // new Date(2021, 2, 31, 12, 30, 23, 0),
            inputIncludeWeekday: false,
            output: "3/31/2021",
        },
        {
            input: new Date(2021, 3, 1, 0, 0, 0, 0).getTime() / 1000,
            inputIncludeWeekday: true,
            output: "Thursday, 4/1/2021",
        },
        {
            input: new Date(2021, 3, 4, 0, 0, 0, 0).getTime() / 1000,
            inputIncludeWeekday: true,
            output: "Sunday, 4/4/2021",
        },
        {
            input: new Date(2021, 3, 5, 0, 0, 0, 0).getTime() / 1000,
            inputIncludeWeekday: true,
            output: "Monday, 4/5/2021",
        },
        {
            input: new Date(2021, 3, 6, 0, 0, 0, 0).getTime() / 1000,
            inputIncludeWeekday: true,
            output: "Tuesday, 4/6/2021",
        },
    ];
    testTable.forEach((test: Test) => {
        expect(helpers.getHumanDate(test.input, test.inputIncludeWeekday)).toEqual(test.output);
    })
});
