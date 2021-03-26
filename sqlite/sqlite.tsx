import * as SQLite from 'expo-sqlite';
import { SQLError, SQLResultSet, SQLTransaction } from 'expo-sqlite';
import { dbname } from '../constants/general';
import { Task, defaultTasks } from '../models/Task';

// import { Asset, FileSystem } from 'expo';

// https://docs.expo.io/versions/latest/sdk/sqlite/#importing-an-existing-database
// export async function openDatabase(pathToDatabaseFile: string): Promise<SQLite.WebSQLDatabase> {
//     if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite')).exists) {
//         await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
//     }
//     await FileSystem.downloadAsync(
//         Asset.fromModule(require(pathToDatabaseFile)).uri,
//         FileSystem.documentDirectory + 'SQLite/myDatabaseName.db'
//     );
//     return SQLite.openDatabase('myDatabaseName.db');
// }

export const getDB = (): SQLite.WebSQLDatabase => {
    // load task definitions from db
    return SQLite.openDatabase(dbname);
}

export const sqlErrCB = (tx: SQLTransaction, error: SQLError): boolean => {
    if (error.code || error.message) {
        console.log(`err code ${error.code}: ${error.message}`);
    }
    return false;
}

const dropTasksDBQuery = 'drop table if exists tasks;'
const initializeTasksDBQuery = 'create table if not exists tasks (id string primary key not null, name string, about text, link text, sortOrder int);'
const initializeHistoryDBQuery = 'create table if not exists history (id string not null, completed int, date int);'

export const initializeDB = (tasks: Task[], resultsCallback: (results: Task[]) => void, txEndCallback?: any): void => {
    const db = getDB();
    if (!db) return;
    db.transaction(
        tx => {
            console.log(`initializeDB: dropping & creating tables`);
            tx.executeSql(dropTasksDBQuery, [], (tx: SQLTransaction, resultSet: SQLResultSet): void => {
                console.log('dropped table tasks');
                tx.executeSql(initializeTasksDBQuery, [], (tx: SQLTransaction, resultSet: SQLResultSet): void => {
                    console.log('created table tasks');
                    tx.executeSql(initializeHistoryDBQuery, [], (tx: SQLTransaction, resultSet: SQLResultSet): void => {
                        console.log('created table history');
                        initializeTasksTx(tx, defaultTasks, tasks, resultsCallback);
                    }, sqlErrCB);
                }, sqlErrCB);
            }, sqlErrCB);
        },
        (error: SQLite.SQLError): void => { console.log(`initializeDB: err callback: ${error.code} ${error.message}`); },
        (): void => { console.log(`initializeDB: void callback`); if (txEndCallback) txEndCallback(); }
    );
}

export const initializeTasksTx = (tx: SQLite.SQLTransaction, defaultTasks: Task[], tasks: Task[], resultsCallback: (results: Task[]) => void): void => {
    if (!tx) return;
    let completedTransactions = 0; // allows us to only proceed once the transaction is completely finished
    defaultTasks.forEach((task: Task) => {
        console.log(`initializeTasks: pushing ${task.id} to db`);
        tx.executeSql(
            'insert into tasks (id, name, about, link, sortOrder) values (?, ?, ?, ?, ?)',
            [task.id, task.name, task.about, task.link, task.order],
            (_, { rows }) => {
                completedTransactions += 1;
                console.log(`initializeTasks: inserted ${task.id}, ${completedTransactions}/${defaultTasks.length}`);
                if (completedTransactions === defaultTasks.length) {
                    initializeDayTaskHistoryTx(tx, defaultTasks, tasks, resultsCallback);
                }
            },
            (tx: SQLTransaction, error: SQLError): boolean => {
                if (error.code || error.message) {
                    console.log(`initializeTasksTx: err code ${error.code}: ${error.message}`);
                }
                completedTransactions += 1;
                // this case is special, because we are expecting unique key errors
                if (completedTransactions === defaultTasks.length) {
                    initializeDayTaskHistoryTx(tx, defaultTasks, tasks, resultsCallback);
                }
                return false;
            }
        )
    });
}

// https://stackoverflow.com/a/61505926/3798673
export const getDateInt = (): number => {
    const today = new Date();
    const tzDiff = new Date(1970, 0, 1).getTime()
    return (new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() - tzDiff) / 1000;
}

export const initializeDayTaskHistoryFromDB = (defaultTasks: Task[], tasks: Task[], resultsCallback: (results: Task[]) => void, forDate?: number, txEndCallback?: any): void => {
    const db = getDB();
    if (!db) return;
    const dateInt = forDate ? forDate : getDateInt();
    db.transaction(
        tx => {
            console.log(`initializeDayTaskHistoryFromDB: populating task history for day ${dateInt}`);
            initializeDayTaskHistoryTx(tx, defaultTasks, tasks, resultsCallback, dateInt);
        },
        (error: SQLite.SQLError): void => { console.log(`initializeDayTaskHistoryFromDB: err callback: ${error.code} ${error.message}`); },
        (): void => { console.log(`initializeDayTaskHistoryFromDB: void callback`); if (txEndCallback) txEndCallback(); }
    );
}

const todayTaskHistorySelectQuery = 'select * from history where id = ? and date = ?';
export const initializeDayTaskHistoryTx = (tx: SQLite.SQLTransaction, defaultTasks: Task[], tasks: Task[], resultsCallback: (results: Task[]) => void, forDate?: number): void => {
    if (!tx) return;
    const dateInt = forDate ? forDate : getDateInt();
    let completedTransactions = 0; // allows us to only proceed once the transaction is completely finished
    defaultTasks.forEach((task: Task, i: number) => {
        console.log(`initializeTodayTaskHistory selecting ${task.id}, ${completedTransactions}/${defaultTasks.length}`);
        tx.executeSql(todayTaskHistorySelectQuery, [task.id, dateInt],
            (tx: SQLTransaction, resultSet: SQLResultSet | any): void => {
                let shouldCreateNewRow = true;
                // on ios/mobile, resultSet is different, and contains _array
                if (resultSet.rows['_array']) {
                    if (resultSet && resultSet.rows['_array'] && resultSet.rows['_array'].length > 0) {
                        shouldCreateNewRow = false;
                    } else {
                        shouldCreateNewRow = true;
                    }
                } else {
                    // on other platforms (like web), the resultSet is different
                    const tasksFromTx = Object.values(resultSet.rows);
                    if (tasksFromTx && tasksFromTx.length > 0) {
                        shouldCreateNewRow = false;
                    } else {
                        shouldCreateNewRow = true;
                    }
                }
                if (shouldCreateNewRow === true) {
                    console.log(`initializeTodayTaskHistory inserting for ${task.id}: ${completedTransactions}/${defaultTasks.length}`);
                    tx.executeSql(
                        'insert into history (id, completed, date) values (?, ?, ?)',
                        [task.id, task.completed ? 1 : 0, dateInt],
                        (_, { rows }) => {
                            completedTransactions += 1;
                            if (completedTransactions === defaultTasks.length) {
                                console.log(`initializeTodayTaskHistory: finished inserting ${task.id}, ${completedTransactions}/${defaultTasks.length}`);
                                getTaskHistoryTx(tx, resultsCallback, forDate);
                                return;
                            }
                            console.log(`initializeTodayTaskHistory: inserted ${task.id}, ${completedTransactions}/${defaultTasks.length}`);
                        },
                        sqlErrCB
                    );
                } else {
                    // do nothing
                    completedTransactions += 1;
                    console.log(`initializeTodayTaskHistory: no need to insert ${task.id}, ${completedTransactions}/${defaultTasks.length}`);
                    return;
                }
            },
            sqlErrCB
        )
    });
}

const deleteTaskQuery = 'DELETE FROM history WHERE id = ? AND date = ?';
const insertTaskQuery = 'insert into history (id, completed, date) values (?, ?, ?)';
export const pushTaskToDB = (task: Task, callback: any, forDate?: number, txEndCallback?: any): void => {
    const db = getDB();
    if (!db) return;
    const dateInt = forDate ? forDate : getDateInt();
    console.log(`pushTaskToDB pushing ${task.id} to db`);
    db.transaction(
        tx => {
            tx.executeSql(deleteTaskQuery, [task.id, dateInt], (tx: SQLTransaction, resultSet: SQLResultSet): void => {
                const tasksArray = Object.values(resultSet.rows);
                console.log(`pushTaskToDB: deleted ${tasksArray} rows`)
                tx.executeSql(insertTaskQuery, [task.id, task.completed ? 1 : 0, dateInt], (tx: SQLTransaction, resultSet: SQLResultSet): void => {
                    const resultsArray = Object.values(resultSet.rows);
                    console.log(`pushTaskToDB: inserted ${resultsArray.length} history item for today: ${task.name}`);
                    callback();
                });
            })
        },
        (error: SQLite.SQLError): void => { console.log(`pushTaskToDB: err callback: ${error.code} ${error.message}`); },
        (): void => { console.log(`pushTaskToDB: void callback`); if (txEndCallback) txEndCallback(); }
    );
}

export const pushTasksToDB = (tasks: Task[], callback: any, forDate?: number, txEndCallback?: any): void => {
    const db = getDB();
    if (!db) return;
    const dateInt = forDate ? forDate : getDateInt();
    let completedTransactions = 0;
    db.transaction(
        tx => {
            tasks.forEach((task: Task) => {
                console.log(`pushTaskToDB: pushing ${task.id} to db`);
                tx.executeSql(deleteTaskQuery, [task.id, dateInt], (tx: SQLTransaction, resultSet: SQLResultSet): void => {
                    const tasksArray = Object.values(resultSet.rows);
                    console.log(`pushTaskToDB: deleted ${tasksArray.length} rows`)
                    tx.executeSql(insertTaskQuery, [task.id, task.completed ? 1 : 0, dateInt], (tx: SQLTransaction, resultSet: SQLResultSet): void => {
                        completedTransactions += 1;
                        const resultsArray = Object.values(resultSet.rows);
                        console.log(`pushTaskToDB: inserted ${resultsArray.length} history item for today: ${task.name} (${completedTransactions}/${tasks.length})`);
                        if (completedTransactions === tasks.length) {
                            callback();
                        }
                    }, sqlErrCB);
                }, sqlErrCB);
            })
        },
        (error: SQLite.SQLError): void => { console.log(`pushTasksToDB: err callback: ${error.code} ${error.message}`); },
        (): void => { console.log(`pushTasksToDB: void callback`); if (txEndCallback) txEndCallback(); }
    );
}

export const resetDB = (txEndCallback?: any) => {
    const db = getDB();
    if (db) {
        console.log(`resetDB: starting`);
        db.transaction(
            tx => {
                tx.executeSql(`DROP TABLE tasks`, undefined, (_, { rows }) => { console.log(`resetDB: reset tasks`); }, sqlErrCB);
                tx.executeSql(`DROP TABLE history`, undefined, (_, { rows }) => { console.log(`resetDB: reset history`); }, sqlErrCB);
            },
            (error: SQLite.SQLError): void => { console.log(`resetDB: err callback: ${error.code} ${error.message}`); },
            (): void => { console.log(`resetDB: void callback`); if (txEndCallback) txEndCallback(); }
        );
    }
}

export const getTaskHistoryFromDB = (resultsCallback: (results: Task[]) => void, forDateInt?: number, txEndCallback?: any) => {
    const db = getDB();
    if (!db) return;
    db.transaction(tx => getTaskHistoryTx(tx, resultsCallback, forDateInt),
        (error: SQLite.SQLError): void => { console.log(`getTaskHistoryFromDB: err callback: ${error.code} ${error.message}`); },
        (): void => { console.log(`getTaskHistoryFromDB: void callback`); if (txEndCallback) txEndCallback(); }
    );
}

const getTaskHistorySQL: string = `SELECT t.id, h.completed, t.name, t.about, t.link, t.sortOrder, h.date FROM tasks AS t LEFT JOIN history AS h on h.id = t.id WHERE h.date = ? ORDER BY t.sortOrder ASC`;
export const getTaskHistoryTx = (tx: SQLite.SQLTransaction, resultsCallback: (results: Task[]) => void, forDateInt?: number) => {
    if (!tx) return;
    const dateInt = forDateInt ? forDateInt : getDateInt();
    console.log(`getTaskHistoryTx: executing select sql for date ${dateInt}`);
    tx.executeSql(getTaskHistorySQL, [dateInt], (tx: SQLTransaction, resultSet: SQLResultSet | any): void => {
        if (resultSet.rows['_array']) {
            // if there is an '_array', it only works on mobile
            const tasksFromTx = resultSet.rows['_array'];
            console.log(`getTaskHistoryTx returned ${tasksFromTx.length} results`);
            if (resultSet && resultSet.rows['_array'] && Array.isArray(resultSet.rows['_array'])) {
                resultsCallback(tasksFromTx.map((task: any, i: number) => {
                    return { name: task.name, id: task.id, completed: task.completed === 1 ? true : false, about: task.about, link: task.link, order: task.sortOrder, date: task.date };
                }));
            }
        } else {
            const tasksFromTx = Object.values(resultSet.rows);
            console.log(`getTaskHistoryTx returned ${tasksFromTx.length} results`);
            // marshal into a task array
            resultsCallback(tasksFromTx.map((task: any, i: number) => {
                return { name: task.name, id: task.id, completed: task.completed === 1 ? true : false, about: task.about, link: task.link, order: task.sortOrder, date: task.date };
            }));
        }
    }, sqlErrCB);
}

export const getTaskStatsSQL: string = `SELECT completed FROM history`;
export const getTaskDaysSQL: string = `SELECT DISTINCT(date) as date FROM history ORDER BY date`;
export const dropTaskHistoryForDaySQL: string = `DELETE FROM history WHERE date = ?`;

export const getQueriesFromDB = (queries: string[], callbacks: any[], txEndCallback?: any) => {
    const db = getDB();
    if (!db) return;
    db.transaction(
        tx => {
            queries.forEach((query: string, i: number) => {
                getQueryTx(tx, query, callbacks[i]);
            })
        },
        (error: SQLite.SQLError): void => { console.log(`getQueriesWithArgsFromDB: err callback: ${error.code} ${error.message}`); },
        (): void => { console.log(`getQueriesWithArgsFromDB: void callback`); if (txEndCallback) txEndCallback(); }
    );
}

export const getQueryTx = (tx: SQLite.SQLTransaction, query: string, callback: any) => {
    if (!tx) return;
    console.log(`getQueryTx: ${query}`);
    tx.executeSql(query, [], (tx: SQLTransaction, resultSet: SQLResultSet | any): void => {
        if (resultSet.rows['_array']) {
            // if there is an '_array', it only works on mobile
            const txResults = resultSet.rows['_array'];
            console.log(`getQueryTx returned ${txResults.length} results`);
            if (resultSet && resultSet.rows['_array'] && resultSet.rows['_array'].length > 0) {
                callback(txResults);
            }
        } else {
            const tasksFromTx = Object.values(resultSet.rows);
            console.log(`getQueryTx returned ${tasksFromTx.length} results`);
            callback(tasksFromTx);
        }
    }, sqlErrCB);
}

export const getQueriesWithArgsFromDB = (queries: string[], args: any[][], callbacks: any[], txEndCallback?: any) => {
    const db = getDB();
    if (!db) return;
    db.transaction(
        tx => {
            queries.forEach((query: string, i: number) => {
                getQueryWithArgsTx(tx, query, args[i], callbacks[i]);
            })
        },
        (error: SQLite.SQLError): void => { console.log(`getQueriesFromDB: err callback: ${error.code} ${error.message}`); },
        (): void => { console.log(`getQueriesFromDB: void callback`); if (txEndCallback) txEndCallback(); }
    );
}

export const getQueryWithArgsTx = (tx: SQLite.SQLTransaction, query: string, args: any[], callback: any) => {
    if (!tx) return;
    console.log(`getQueryWithArgsTx: ${query}`);
    tx.executeSql(query, args, (tx: SQLTransaction, resultSet: SQLResultSet | any): void => {
        if (resultSet.rows['_array']) {
            // if there is an '_array', it only works on mobile
            const txResults = resultSet.rows['_array'];
            console.log(`getQueryWithArgsTx returned ${txResults.length} results`);
            if (resultSet && txResults && Array.isArray(txResults)) {
                callback(txResults);
            }
        } else {
            const tasksFromTx = Object.values(resultSet.rows);
            console.log(`getQueryWithArgsTx returned ${tasksFromTx.length} results`);
            callback(tasksFromTx);
        }
    }, sqlErrCB);
}
