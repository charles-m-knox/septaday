import * as helpers from './helpers';

test("getDateInt should return the UTC seconds value of a given current date", () => {
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
        // uncomment and use https://www.epochconverter.com/ to test the input
        // for today's date - this is awkward to test otherwise
        // {
        //     input: undefined,
        //     output: 1617148800,
        // }
    ];
    testTable.forEach((test: Test) => {
        expect(helpers.getDateInt(test.input)).toEqual(test.output);
    })
});

test("getOffsetDaysFromInt should return the correct dates", () => {
    interface Test {
        input: number;
        inputDaysOffset: number;
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
    ];
    testTable.forEach((test: Test) => {
        expect(helpers.getOffsetDaysFromInt(test.input, test.inputDaysOffset)).toEqual(test.output);
    })
});

test("getHumanDate should return a human-readable date", () => {
    interface Test {
        input: number;
        inputIncludeWeekday: boolean;
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
            inputIncludeWeekday: true,
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
    ];
    testTable.forEach((test: Test) => {
        expect(helpers.getHumanDate(test.input, test.inputIncludeWeekday)).toEqual(test.output);
    })
});
