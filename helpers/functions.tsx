import { Task } from "../models/Task";
import { deleteTaskQuery, dropHistoryDBQuery, dropTaskHistoryForDaySQL, dropTasksDBQuery, getTaskHistorySQL, insertTaskQuery } from "./queries";
import { doQueriesWithArgsFromDB } from "./sqlite";
import { getDateInt } from './helpers';

export const getTasksFromDB = (cb: (results: Task[]) => void, forDateInt?: number): void => {
    const dt = forDateInt ? forDateInt : getDateInt();
    doQueriesWithArgsFromDB(
        [getTaskHistorySQL],
        [[dt]],
        [cb],
        () => { console.log(`getTasksFromDB: ${dt} done!`) }
    );
}

export const deleteDayTasks = (cb: () => void, forDateInt?: number): void => {
    const dt = forDateInt ? forDateInt : getDateInt();
    console.log(`deleteDayTasks for ${dt}: starting`);
    doQueriesWithArgsFromDB(
        [dropTaskHistoryForDaySQL],
        [[dt]],
        [cb],
        () => { console.log(`deleteDayTasks: ${dt} done!`) }
    );
}

export const resetDB = (cb: () => void): void => {
    console.log(`resetDB: starting`);
    doQueriesWithArgsFromDB(
        [dropTasksDBQuery, dropHistoryDBQuery],
        [],
        [],
        () => { console.log(`resetDB: done`); cb && cb(); }
    );
}

export const updateTask = (task: Task, cb: () => void, forDateInt?: number): void => {
    const dt = forDateInt ? forDateInt : getDateInt();
    console.log(`updateTask for ${dt}, task id ${task.id}: starting`);
    doQueriesWithArgsFromDB(
        [deleteTaskQuery],
        [[task.id, dt]],
        [() => {
            doQueriesWithArgsFromDB(
                [insertTaskQuery],
                [[task.id, task.completed ? 1 : 0, dt]],
                [],
            )
        }],
        () => { console.log(`updateTask ${dt}, task id ${task.id}: done!`); cb(); }
    );
}

export const updateTasks = (tasks: Task[], cb: () => void, forDateInt?: number): void => {
    const dt = forDateInt ? forDateInt : getDateInt();
    console.log(`updateTasks for ${dt}: starting`);
    doQueriesWithArgsFromDB(
        tasks.map(_ => deleteTaskQuery),
        tasks.map((task: Task) => [task.id, dt]),
        [() => {
            doQueriesWithArgsFromDB(
                tasks.map(_ => insertTaskQuery),
                tasks.map((task: Task) => [task.id, task.completed ? 1 : 0, dt]),
                [],
            )
        }],
        () => { console.log(`updateTasks for ${dt}: done!`); cb(); }
    );
}

