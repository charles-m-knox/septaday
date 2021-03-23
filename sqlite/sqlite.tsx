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

const initializeTasksDBQuery = 'create table if not exists tasks (id string primary key not null, name string, about text, sortOrder int);'
const initializeHistoryDBQuery = 'create table if not exists history (id string not null, completed int, date int);'

export const initializeDB = (db: SQLite.WebSQLDatabase, tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>, txEndCallback?: any): void => {
    if (!db) return;
    db.transaction(
        tx => {
            console.log(`initializeDB: creating tables`);
            tx.executeSql(initializeTasksDBQuery, [], (tx: SQLTransaction, resultSet: SQLResultSet): void => {
                console.log('created table tasks');
                tx.executeSql(initializeHistoryDBQuery, [], (tx: SQLTransaction, resultSet: SQLResultSet): void => {
                    console.log('created table history');
                    initializeTasksTx(tx, defaultTasks, tasks, setTasks);
                }, sqlErrCB);
            }, sqlErrCB);
        },
        (error: SQLite.SQLError): void => { console.log(`initializeDB: err callback: ${error.code} ${error.message}`); },
        (): void => { console.log(`initializeDB: void callback`); if (txEndCallback) txEndCallback(); }
    );
}

export const initializeTasksTx = (tx: SQLite.SQLTransaction, defaultTasks: Task[], tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>): void => {
    if (!tx) return;
    let completedTransactions = 0; // allows us to only proceed once the transaction is completely finished
    defaultTasks.forEach((task: Task) => {
        console.log(`initializeTasks: pushing ${task.id} to db`);
        tx.executeSql(
            'insert into tasks (id, name, about, sortOrder) values (?, ?, ?, ?)',
            [task.id, task.name, task.about, task.order],
            (_, { rows }) => {
                completedTransactions += 1;
                console.log(`initializeTasks: inserted ${task.id}, ${completedTransactions}/${defaultTasks.length}`);
                if (completedTransactions === defaultTasks.length) {
                    initializeTodayTaskHistoryTx(tx, defaultTasks, tasks, setTasks);
                }
            },
            (tx: SQLTransaction, error: SQLError): boolean => {
                if (error.code || error.message) {
                    console.log(`initializeTasksTx: err code ${error.code}: ${error.message}`);
                }
                completedTransactions += 1;
                // this case is special, because we are expecting unique key errors
                if (completedTransactions === defaultTasks.length) {
                    initializeTodayTaskHistoryTx(tx, defaultTasks, tasks, setTasks);
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

export const initializeTodayTaskHistoryTx = (tx: SQLite.SQLTransaction, defaultTasks: Task[], tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>): void => {
    if (!tx) return;
    const dateInt = getDateInt();
    let completedTransactions = 0; // allows us to only proceed once the transaction is completely finished
    defaultTasks.forEach((task: Task, i: number) => {
        console.log(`initializeTodayTaskHistory selecting ${task.id}, ${completedTransactions}/${defaultTasks.length}`);
        tx.executeSql('select * from history where id = ? and date = ?',
            [task.id, dateInt],
            (tx: SQLTransaction, /* resultSet: SQLResultSet */ resultSet: any): void => {
                const tasksArray = resultSet.rows['_array'];
                console.log(`initializeTodayTaskHistoryTx returned ${tasksArray.length}`);
                console.log(`initializeTodayTaskHistoryTx returned ${JSON.stringify(resultSet)}`);
                if (tasksArray.length > 0) {
                    // do nothing
                    completedTransactions += 1;
                    console.log(`initializeTodayTaskHistory: no need to insert ${task.id}, ${completedTransactions}/${defaultTasks.length}`);
                    return;
                }
                console.log(`initializeTodayTaskHistory inserting for ${task.id}: ${tasksArray.length}, ${completedTransactions}/${defaultTasks.length}`);
                tx.executeSql(
                    'insert into history (id, completed, date) values (?, ?, ?)',
                    [task.id, task.completed ? 1 : 0, dateInt],
                    (_, { rows }) => {
                        completedTransactions += 1;
                        if (completedTransactions === defaultTasks.length) {
                            console.log(`initializeTodayTaskHistory: finished inserting ${task.id}, ${completedTransactions}/${defaultTasks.length}`);
                            getTaskHistoryTx(tx, setTasks);
                            return;
                        }
                        console.log(`initializeTodayTaskHistory: inserted ${task.id}, ${completedTransactions}/${defaultTasks.length}`);
                    },
                    sqlErrCB
                );
            },
            sqlErrCB
        )
    });
}

const deleteTaskQuery = 'DELETE FROM history WHERE id = ? AND date = ?';
const insertTaskQuery = 'insert into history (id, completed, date) values (?, ?, ?)';
export const pushTaskToDB = (db: SQLite.WebSQLDatabase, task: Task, callback: any, txEndCallback?: any): void => {
    if (!db) return;
    const dateInt = getDateInt();
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

export const pushTasksToDB = (db: SQLite.WebSQLDatabase, tasks: Task[], callback: any, txEndCallback?: any): void => {
    if (!db) return;
    const dateInt = getDateInt();
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

export const resetDB = (db: SQLite.WebSQLDatabase, txEndCallback?: any) => {
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

export const getTaskHistoryFromDB = (db: SQLite.WebSQLDatabase, setTasks: React.Dispatch<React.SetStateAction<Task[]>>, txEndCallback?: any) => {
    if (!db) return;
    db.transaction(tx => getTaskHistoryTx(tx, setTasks),
        (error: SQLite.SQLError): void => { console.log(`getTaskHistoryFromDB: err callback: ${error.code} ${error.message}`); },
        (): void => { console.log(`getTaskHistoryFromDB: void callback`); if (txEndCallback) txEndCallback(); }
    );
}

const getTaskHistorySQL: string = `SELECT t.id, h.completed, t.name, t.sortOrder, h.date FROM tasks AS t LEFT JOIN history AS h on h.id = t.id WHERE h.date = ? ORDER BY t.sortOrder ASC`;
export const getTaskHistoryTx = (tx: SQLite.SQLTransaction, setTasks: React.Dispatch<React.SetStateAction<Task[]>>) => {
    if (!tx) return;
    const dateInt = getDateInt();
    console.log(`getTaskHistoryFromDB: executing select sql`);
    tx.executeSql(getTaskHistorySQL, [dateInt], (tx: SQLTransaction, /* resultSet: SQLResultSet */ resultSet: any): void => {
        const tasksFromTx = resultSet.rows['_array'];
        console.log(`getTaskHistoryFromDB returned ${tasksFromTx.length}`);
        console.log(`getTaskHistoryFromDB returned ${JSON.stringify(resultSet)}`);
        // marshal into a task array
        setTasks(tasksFromTx.map((task: any, i: number) => {
            return { name: task.name, id: task.id, completed: task.completed === 1 ? true : false, about: task.about, order: task.sortOrder, date: task.date };
        }));
    }, sqlErrCB);
}
