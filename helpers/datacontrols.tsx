import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { createOneButtonAlert, createTwoButtonAlert } from '../helpers/alerts';
import { dbname } from '../constants/general';

export const getDBFilePath = (): string => {
    const dd = FileSystem.documentDirectory ? FileSystem.documentDirectory : '';
    if (!dd) return '';
    return `${dd}/SQLite/${dbname}`;
}

export const importDB = () => {
    const dbFilePath = getDBFilePath();
    if (!dbFilePath) return;
    createTwoButtonAlert(
        'Import Process',
        'In the next screen, you will be asked to pick a document from the native document picker. Please pick a valid sqlite file. After selecting the file, the import will occur, you will lose all current data, and you will have to restart this app. Proceed?',
        'Proceed',
        'destructive',
        () => {
            DocumentPicker.getDocumentAsync(
                {
                    type: '*/*',
                    copyToCacheDirectory: true,
                    multiple: false,
                }
            ).then((result: DocumentPicker.DocumentResult) => {
                console.log(`importDB: document picker: ${JSON.stringify(result)}`);
                if (result.type !== "success") return;
                // copy the file over the current db?
                FileSystem.copyAsync({
                    from: result.uri,
                    to: dbFilePath,
                }).then(() => {
                    console.log(`importDB: finished!`);
                    createOneButtonAlert(
                        'Restart',
                        'The import has completed. You must restart the app manually now. The next time you start the app, it will contain your new data.',
                        'OK',
                        'default',
                        () => {
                            console.log('importDB: user confirmed they need to restart');
                        }
                    )
                })
            });
        }
    )
}

export const exportDB = () => {
    Sharing.isAvailableAsync().then((isAvailable: boolean) => {
        console.log(`exportDB: sharing available: ${isAvailable}`);
        if (isAvailable) {
            console.log(`fs document directory: ${FileSystem.documentDirectory}`);
            Sharing.shareAsync(
                getDBFilePath(),
                {
                    mimeType: 'application/x-sqlite3', // http://fileformats.archiveteam.org/wiki/DB_(SQLite)
                    UTI: 'public.database', // https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/UTIRef/Articles/System-DeclaredUniformTypeIdentifiers.html#//apple_ref/doc/uid/TP40009259-SW1
                    dialogTitle: `Export ${dbname}`
                }
            ).then((value: any) => {
                console.log(`exportDB: shared promise resolved: ${JSON.stringify(value)}`);
            });
        }
    })
}
