import * as taskhelpers from './taskhelpers';
import { Task, defaultTasks } from "../models/Task";

test("getCompletedTasks should return number of completed tasks for an array of tasks", () => {
    interface Test {
        input: Task[];
        output: number;
    }
    const testTable: Test[] = [
        {
            input: defaultTasks.map((task: Task) => { return { ...task, completed: true } }),
            output: defaultTasks.length,
        },
        {
            input: defaultTasks.map((task: Task) => { return { ...task, completed: false } }),
            output: 0,
        },
        {
            input: defaultTasks.map((task: Task, i: number) => { return { ...task, completed: (i === 0 ? false : true) } }),
            output: defaultTasks.length - 1,
        },
    ];
    testTable.forEach((test: Test) => {
        expect(taskhelpers.getCompletedTasks(test.input)).toEqual(test.output);
    })
});