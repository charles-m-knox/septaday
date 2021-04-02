import * as SQLite from 'expo-sqlite';
import { SQLError, SQLResultSet, SQLTransaction } from 'expo-sqlite';
import { dbname } from '../constants/general';
import { Task, defaultTasks } from '../models/Task';
import { getTasksFromDB } from './functions';
import { getDateInt } from './helpers';

import {
    dropTasksDBQuery,
    initializeTasksDBQuery,
    initializeHistoryDBQuery,
    todayTaskHistorySelectQuery,
} from './queries';

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
                                getTasksFromDB(resultsCallback, forDate);
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

export const doQueriesWithArgsFromDB = (queries: string[], args: any[][], callbacks: any[], txEndCallback?: any) => {
    const db = getDB();
    if (!db) return;
    db.transaction(
        tx => {
            queries.forEach((query: string, i: number) => {
                doQueryWithArgsTx(tx, query, args[i], callbacks[i]);
            });
        },
        (error: SQLite.SQLError): void => { console.log(`doQueriesWithArgsFromDB: err callback: ${error.code} ${error.message}`); },
        (): void => { console.log(`doQueriesWithArgsFromDB: void callback`); if (txEndCallback) txEndCallback(); }
    );
}

export const doQueryWithArgsTx = (tx: SQLite.SQLTransaction, query: string, args: any[], callback: any) => {
    if (!tx) return;
    console.log(`doQueryWithArgsTx: ${query}`);
    tx.executeSql(query, args, (tx: SQLTransaction, resultSet: SQLResultSet | any): void => {
        if (resultSet.rows['_array']) {
            // if there is an '_array', it only works on mobile
            const txResults = resultSet.rows['_array'];
            console.log(`doQueryWithArgsTx returned ${txResults.length} results`);
            if (resultSet && txResults && Array.isArray(txResults)) {
                callback && callback(txResults);
            } else {
                callback && callback([]);
            }
        } else {
            const resultsFromTx: any[] = Object.values(resultSet.rows);
            console.log(`doQueryWithArgsTx returned ${resultsFromTx.length} results`);
            callback && callback(resultsFromTx);
        }
    }, (tx: SQLTransaction, error: SQLError): boolean => {
        if (error.code || error.message) {
            console.log(`doQueryWithArgsTx ${query}: err code ${error.code}: ${error.message}`);
        }
        return false;
    })
}
