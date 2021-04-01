import { Task } from "../models/Task";
import { getTaskHistorySQL } from "./queries";
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
