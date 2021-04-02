import * as SQLite from 'expo-sqlite';
import { SQLError, SQLResultSet, SQLTransaction } from 'expo-sqlite';
import { dbname } from '../constants/general';

export const getDB = (): SQLite.WebSQLDatabase => {
    // load task definitions from db
    return SQLite.openDatabase(dbname);
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
