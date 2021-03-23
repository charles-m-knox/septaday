import * as SQLite from 'expo-sqlite';
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

export const initializeDB = (db: SQLite.WebSQLDatabase): void => {
    if (db) {
        db.transaction(tx => {
            tx.executeSql(
                'create table if not exists tasks (id string primary key not null, name string, about text, sortOrder int);',
                [],
                () => {
                    console.log('created table tasks');
                    initializeTasks(db, defaultTasks);
                    initializeTodayTaskHistory(db, defaultTasks);
                }
            );
        });

        db.transaction(tx => {
            tx.executeSql(
                'create table if not exists history (id string not null, completed int, date int);',
                [],
                () => {
                    console.log('created table history');
                }
            );
        });
    }
}

export const initializeTasks = (db: SQLite.WebSQLDatabase, tasks: Task[]): void => {
    if (db) {
        tasks.forEach((task: Task) => {
            console.log(`pushing ${task.id} to db`);
            db.transaction(
                tx => {
                    tx.executeSql(
                        'insert into tasks (id, name, about, sortOrder) values (?, ?, ?, ?)',
                        [
                            task.id,
                            task.name,
                            task.about,
                            task.order,
                        ],
                        (_, { rows }) => {
                            console.log(JSON.stringify(rows));
                            console.log(Object.values(rows));
                        }
                    );
                },
                (err) => {
                    console.log(`err pushing task to db`);
                },
                () => {
                    console.log('done');
                }
            );
        });
    }
}


// https://stackoverflow.com/a/61505926/3798673
export const getDateInt = (): number => {
    const today = new Date();
    const tzDiff = new Date(1970, 0, 1).getTime()
    return (new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() - tzDiff) / 1000;
}

export const initializeTodayTaskHistory = (db: SQLite.WebSQLDatabase, tasks: Task[]): void => {
    if (db) {
        const dateInt = getDateInt();
        tasks.forEach((task: Task) => {
            console.log(`pushing today's ${task.id} to db`);
            db.transaction(
                tx => {
                    console.log(`initializeTodayTaskHistory selecting ${task.id}`);
                    tx.executeSql('select * from history where id = ? and date = ?',
                        [task.id, dateInt],
                        (tx, { rows }) => {
                            const tasksArray = Object.values(rows);
                            console.log(`initializeTodayTaskHistory results for ${task.id}: ${tasksArray.length}`);
                            if (tasksArray.length > 0) {
                                // do nothing
                                console.log(`found history item for today`)
                            } else {
                                console.log(`initializeTodayTaskHistory inserting for ${task.id}: ${tasksArray.length}`);
                                tx.executeSql(
                                    'insert into history (id, completed, date) values (?, ?, ?)',
                                    [task.id, task.completed, dateInt],
                                    (_, { rows }) => { console.log(`inserted history item for today ${task.id}, rows: ${rows}`); },
                                );
                            }
                        },
                    )
                },
                (err) => {
                    console.log(`initializeTodayTaskHistory err pushing task to db`);
                },
                () => {
                    console.log('initializeTodayTaskHistory done');
                }
            );
        });
    }
}

// https://www.sqlite.org/lang_UPSERT.html
/*
CREATE TABLE phonebook2(
  name TEXT PRIMARY KEY,
  phonenumber TEXT,
  validDate DATE
);
INSERT INTO phonebook2(name,phonenumber,validDate)
  VALUES('Alice','704-555-1212','2018-05-08')
  ON CONFLICT(name) DO UPDATE SET
    phonenumber=excluded.phonenumber,
    validDate=excluded.validDate
  WHERE excluded.validDate>phonebook2.validDate;
*/
// const pushTaskQuery = `INSERT INTO history(id, completed, date) VALUES (?, ?, ?) ON CONFLICT(date, id) DO UPDATE SET completed=excluded.completed`;
// insert into history(id, completed, date) VALUES ('e409699d-119e-4624-9e7d-e74b2659cf31', 1, 1616371200) ON CONFLICT(id, date) DO UPDATE SET completed=excluded.completed;
export const pushTaskToDB = (db: SQLite.WebSQLDatabase, task: Task): void => {
    if (db) {
        const dateInt = getDateInt();
        console.log(`pushing ${task.id} to db`);
        db.transaction(
            tx => {
                console.log(`pushTaskToDB selecting ${task.id}`);
                tx.executeSql('DELETE FROM history WHERE id = ? AND date = ?',
                    [task.id, dateInt],
                    (tx, { rows }) => {
                        const tasksArray = Object.values(rows);
                        console.log(`pushTaskToDB results for ${task.id}: ${tasksArray.length}`);
                        console.log(`pushTaskToDB inserting for ${task.id}: ${tasksArray.length}`);
                        tx.executeSql(
                            'insert into history (id, completed, date) values (?, ?, ?)',
                            [task.id, task.completed, dateInt],
                            (_, { rows }) => { console.log(`inserted history item for today ${task.id}, rows: ${rows}`); },
                        );
                    },
                )
                /* tx.executeSql(
                    // `INSERT INTO history(id, completed, date) SELECT ?, ?, ? WHERE NOT EXISTS(SELECT 1 FROM history WHERE id = ? AND date = ?);`,
                    // pushTaskQuery,
                    `DELETE FROM history WHERE id = ? AND date = ?`,
                    [task.id, dateInt],
                    (success) => {
                        console.log(`upsert success: ${success}`);
                        addTaskToDB(db, task);
                    },
                    // (err) => {
                    //     console.log(`upsert err: ${JSON.stringify(err)}`);
                    //     return true;
                    // },
                ); */
            },
            (err) => {
                console.log(`err pushing task to db`);
            },
            () => {
                console.log('done');
            }
        );
    }
}

export const addTaskToDB = (db: SQLite.WebSQLDatabase, task: Task): void => {
    if (db) {
        const dateInt = getDateInt();
        console.log(`pushing ${task.id} to db`);
        db.transaction(
            tx => {
                tx.executeSql(
                    `INSERT INTO history(id, completed, date) VALUES(?, ?, ?)`,
                    [task.id, task.completed, dateInt],
                    (success) => {
                        console.log(`upsert success: ${success}`);
                        getTaskHistoryFromDB(db);
                    },
                    // (err) => {
                    //     console.log(`upsert err: ${JSON.stringify(err)}`);
                    //     return true;
                    // },
                );
            },
            (err) => {
                console.log(`err pushing task to db`);
            },
            () => {
                console.log('addTaskToDB done');
            }
        );
    }
}

export const getTaskHistoryFromDB = (db: SQLite.WebSQLDatabase, callback?: (tasks: Task[]) => void) => {
    if (db) {
        const dateInt = getDateInt();
        db.readTransaction(
            tx => {
                tx.executeSql(
                    `SELECT t.id, h.completed, t.name, t.sortOrder, h.date FROM tasks AS t LEFT JOIN history AS h on h.id = t.id WHERE h.date = ? ORDER BY t.sortOrder ASC`,
                    // `SELECT * FROM history WHERE date = ? ORDER BY sortOrder ASC`,
                    [dateInt],
                    (_, { rows }) => {
                        console.log(`getTaskHistoryFromDB returned ${Object.values(rows).length}`);
                        // marshal into a task array
                        const newTasks = Object.values(rows).map((task: any) => {
                            return {
                                name: task.name,
                                id: task.id,
                                completed: task.completed === "true",
                                about: task.about,
                                order: task.sortOrder,
                                date: task.date,
                            }
                        })
                        if (callback) {
                            callback(newTasks);
                        }
                    }
                )
            }
        )
    }
}