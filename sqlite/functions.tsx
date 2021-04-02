import { Task } from "../models/Task";
import { deleteTaskQuery, dropTaskHistoryForDaySQL, getTaskHistorySQL, insertTaskQuery } from "./queries";
import { doQueriesWithArgsFromDB } from "./sqlite";
import { getDateInt } from '../helpers/helpers';

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
