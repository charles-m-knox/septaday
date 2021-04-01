import { Task } from "../models/Task";
import { getTaskHistorySQL } from "./queries";
import { doQueriesWithArgsFromDB } from "./sqlite";
import { getDateInt } from '../helpers/helpers';

export const getTasksFromDB = (cb: (results: Task[]) => void, forDateInt?: number): void => {
    doQueriesWithArgsFromDB(
        [getTaskHistorySQL],
        [[forDateInt ? forDateInt : getDateInt()]],
        [cb],
        () => { console.log(`getTasksFromDB: ${forDateInt} done!`) }
    );
}
