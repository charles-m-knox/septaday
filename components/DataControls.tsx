import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
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
      <View style={styles.actionContainer}>
        <TouchableOpacity onPress={() => { resetDB(db); }} style={styles.helpLink}>
          <Text style={styles.helpText} lightColor={Colors.light.tint}>
            Destroy all data.
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.actionContainer}>
        <TouchableOpacity onPress={() => { initializeDB(db, tasks, setTasks); }} style={styles.helpLink}>
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
    paddingHorizontal: 24,
    maxWidth: "66%",
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
