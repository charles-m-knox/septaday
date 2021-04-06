import { defaultTasks, Task } from "../models/Task";
import { doQueriesWithArgsFromDB } from "./sqlite";
import { getDateInt } from './helpers';
import {
    deleteTaskQuery,
    dropHistoryDBQuery,
    dropTaskHistoryForDaySQL,
    dropTasksDBQuery,
    getTaskHistorySQL,
    initializeHistoryDBQuery,
    initializeTaskQuery,
    initializeTasksDBQuery,
    initializeTodayTaskHistoryQuery,
    insertTaskQuery
} from "./queries";

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
        () => { console.log(`updateTask ${dt}, task id ${task.id}: done!`); cb && cb(); }
    );
}

export const insertTasks = (tasks: Task[], cb: () => void, forDateInt?: number): void => {
    const dt = forDateInt ? forDateInt : getDateInt();
    console.log(`insertTasks (${tasks.length}) for ${dt}: starting`);
    doQueriesWithArgsFromDB(
        tasks.map(_ => insertTaskQuery),
        tasks.map((task: Task) => [task.id, task.completed ? 1 : 0, dt]),
        tasks.map((task: Task, i: number) => { return () => { console.log(`insertTasks inserted task ${task.id} (${i + 1}/${tasks.length})`) } }),
        () => { console.log(`insertTasks (${tasks.length}) for ${dt}: done!`); cb && cb(); }
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
        () => { console.log(`updateTasks for ${dt}: done!`); cb && cb(); }
    );
}

export const initializeDB = (cb: () => void): void => {
    console.log(`initializeDB: starting by dropping tasks table`);
    doQueriesWithArgsFromDB(
        [dropTasksDBQuery], [], [],
        () => {
            console.log(`initializeDB: dropped tasks table; now creating tasks and history tables safely`);
            doQueriesWithArgsFromDB(
                [initializeTasksDBQuery, initializeHistoryDBQuery], [], [], () => {
                    console.log(`initializeDB: created tasks and history tables; initializing tasks`);
                    initializeTasksTable(cb);
                }
            )
        }
    );
}

export const initializeTasksTable = (cb: () => void): void => {
    console.log(`initializeTasksTable: starting`);
    doQueriesWithArgsFromDB(
        defaultTasks.map(_ => initializeTaskQuery),
        defaultTasks.map((task: Task) => [task.id, task.name, task.about, task.link, task.order]),
        [],
        () => { console.log(`initializeTasksTable: done!`); initializeTasksForDay(cb); }
    );
}

export const initializeTasksForDay = (cb: () => void, forDateInt?: number): void => {
    const dt = forDateInt ? forDateInt : getDateInt();
    console.log(`initializeTasksForDay for ${dt}: starting`);
    doQueriesWithArgsFromDB(
        defaultTasks.map(_ => initializeTodayTaskHistoryQuery),
        defaultTasks.map((task: Task) => [task.id, 0, dt, task.id, dt]),
        [],
        () => { cb && cb(); console.log(`updateTasks for ${dt}: done!`); }
    );
}
