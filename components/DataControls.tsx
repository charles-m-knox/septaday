import React from 'react';
import { StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import Colors from '../constants/Colors';
import { Text, View } from './Themed';
import { Task } from '../models/Task';
import { initializeDB, resetDB } from '../sqlite/sqlite';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { dbname } from '../constants/general';
import * as DocumentPicker from 'expo-document-picker';

const DataControls = ({ tasks, setTasks }: {
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
}): JSX.Element => {

  const destroyAlertTitle = "Are you sure?";
  const destroyAlertMessage = "Only destroy all of your data if you know what you're doing. This will erase all of your historical task data and reset the local database completely. You must also initialize the database afterwards. Proceed?";
  const destroyAlertAction = "Destroy";

  const initializeAlertTitle = "Are you sure?";
  const initializeAlertMessage = "Only initialize the data if you know what you're doing. Doing this may not have any effect, but in general the only reason to do this is if you've just destroyed all of the data. Proceed?";
  const initializeAlertAction = "Initialize";

  const createTwoButtonAlert = (title: string, message: string, action: string, callback?: any): void => {
    if (Platform.OS === "web") {
      if (confirm(message)) {
        callback();
      }
    } else {
      Alert.alert(
        title,
        message,
        [
          { text: "Cancel", onPress: () => { }, style: "cancel" },
          { text: action, onPress: () => { callback(); }, style: "destructive" }
        ],
        { cancelable: false }
      );
    }
  }

  const createOneButtonAlert = (title: string, message: string, action: string, callback?: any): void => {
    if (Platform.OS === "web") {
      alert(message);
    } else {
      Alert.alert(
        title,
        message,
        [
          { text: action, onPress: () => { if (callback) callback(); }, style: "default" },
        ],
        { cancelable: false }
      );
    }
  }

  const getDBFilePath = (): string => {
    const dd = FileSystem.documentDirectory ? FileSystem.documentDirectory : '';
    if (!dd) return '';
    return `${dd}/SQLite/${dbname}`;
  }

  const importDB = () => {
    const dbFilePath = getDBFilePath();
    if (!dbFilePath) return;
    createTwoButtonAlert(
      'Import Process',
      'In the next screen, you will be asked to pick a document from the native document picker. Please pick a valid sqlite file. After selecting the file, the import will occur, you will lose all current data, and you will have to restart this app. Proceed?',
      'Proceed',
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
              () => {
                console.log('importDB: user confirmed they need to restart');
              }
            )
          })
        });
      }
    )
  }

  const exportDB = () => {
    const dd = FileSystem.documentDirectory ? FileSystem.documentDirectory : '';
    // console.log(`exportDB: dd ${dd}`);
    // if (!dd) return;
    // FileSystem.readDirectoryAsync(dd).then((files: string[]) => {
    //   files.forEach((file: string) => {
    //     console.log(`files: ${file}`)
    //   })
    // });
    // return;
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

  return (
    <View style={styles.container}>
      <View>
        <Text
          style={styles.aboutText}
          lightColor="rgba(0,0,0,0.8)"
          darkColor="rgba(255,255,255,0.8)">
          Manage your data here. All data is stored locally on your device.
        </Text>
      </View>
      <View>
        <TouchableOpacity onPress={() => { exportDB(); }} style={styles.helpLink}>
          <Text style={styles.helpText} lightColor={Colors.light.tint}>
            Export all data.
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => { importDB(); }} style={styles.helpLink}>
          <Text style={styles.helpText} lightColor={Colors.light.tint}>
            Import all data.
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => { createTwoButtonAlert(destroyAlertTitle, destroyAlertMessage, destroyAlertAction, () => { resetDB(createOneButtonAlert('Destroy Data', 'Done!', 'OK')); }); }} style={styles.helpLink}>
          <Text style={styles.helpText} lightColor={Colors.light.tint}>
            Destroy all data.
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => { createTwoButtonAlert(initializeAlertTitle, initializeAlertMessage, initializeAlertAction, () => { initializeDB(tasks, (results: Task[]) => { setTasks(results); }, createOneButtonAlert('Initialize Data', 'Done!', 'OK')); }); }} style={styles.helpLink}>
          <Text style={styles.helpText} lightColor={Colors.light.tint}>
            Initialize all data.
          </Text>
        </TouchableOpacity>
      </View>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: "66%",
    width: "66%",
  },
  aboutText: {
    textAlign: 'left',
  },
  actionContainer: {
    marginTop: 15,
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpText: {
    textAlign: 'left',
  },
});

export default DataControls;
