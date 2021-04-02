import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../constants/Colors';
import { Text, View } from './Themed';
import { Task } from '../models/Task';
import { initializeDB } from '../helpers/sqlite';
import { createOneButtonAlert, createTwoButtonAlert } from '../helpers/alerts';
import {
  destroyAlertAction,
  destroyAlertMessage,
  destroyAlertTitle,
  initializeAlertAction,
  initializeAlertMessage,
  initializeAlertTitle
} from '../constants/general';
import { exportDB, importDB } from '../helpers/datacontrols';
import { resetDB } from '../helpers/functions';

const DataControls = ({ tasks, setTasks }: {
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
        <TouchableOpacity onPress={() => { createTwoButtonAlert(destroyAlertTitle, destroyAlertMessage, destroyAlertAction, 'destructive', () => { resetDB(createOneButtonAlert('Destroy Data', 'Done!', 'OK', 'default')); }); }} style={styles.helpLink}>
          <Text style={styles.helpText} lightColor={Colors.light.tint}>
            Destroy all data.
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => { createTwoButtonAlert(initializeAlertTitle, initializeAlertMessage, initializeAlertAction, 'destructive', () => { initializeDB(tasks, (results: Task[]) => { setTasks(results); }, createOneButtonAlert('Initialize Data', 'Done!', 'OK', 'default')); }); }} style={styles.helpLink}>
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
