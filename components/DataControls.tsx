import React, { useState } from 'react';
import Constants from 'expo-constants';
import { StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import Colors from '../constants/Colors';
import { Text, View } from './Themed';
// import { Ionicons } from '@expo/vector-icons';
// import { Entypo } from '@expo/vector-icons';
import { Task } from '../models/Task';
import * as SQLite from 'expo-sqlite';
import { initializeDB, resetDB } from '../sqlite/sqlite';

const DataControls = ({ db, tasks, setTasks }: {
  db: SQLite.WebSQLDatabase,
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
        <TouchableOpacity onPress={() => { createTwoButtonAlert(destroyAlertTitle, destroyAlertMessage, destroyAlertAction, () => { resetDB(db, createOneButtonAlert('Destroy Data', 'Done!', 'OK')); }); }} style={styles.helpLink}>
          <Text style={styles.helpText} lightColor={Colors.light.tint}>
            Destroy all data.
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => { createTwoButtonAlert(initializeAlertTitle, initializeAlertMessage, initializeAlertAction, () => { initializeDB(db, tasks, setTasks, createOneButtonAlert('Initialize Data', 'Done!', 'OK')); }); }} style={styles.helpLink}>
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
