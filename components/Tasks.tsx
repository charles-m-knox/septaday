import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { defaultTasks, Task } from '../models/Task';
import Colors from '../constants/Colors';
import { Text, View } from './Themed';
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import { dropTaskHistoryForDaySQL, getDateInt, getQueriesWithArgsFromDB, getTaskHistoryFromDB, initializeDayTaskHistoryFromDB, initializeDB, pushTasksToDB, pushTaskToDB, resetDB } from '../sqlite/sqlite';
import useColorScheme from '../hooks/useColorScheme';
import { getSimpleDate } from '../helpers/helpers';

const Tasks = ({ tasks, setTasks, db, viewTime }: {
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  db: SQLite.WebSQLDatabase,
  viewTime: number,
}): JSX.Element => {
  const colorScheme = useColorScheme();

  const useForceUpdate = () => {
    console.log("useForceUpdate called");
    // const [value, setValue] = useState(0);
    // return [() => setValue(value + 1), value];
  }
  // const [forceUpdate, forceUpdateId] = useForceUpdate();

  const getCompletedTasksForDay = (allTasks: Task[]): number => {
    let result = 0;
    allTasks.forEach((task: Task) => {
      if (task.completed === true) {
        result += 1;
      }
    });
    return result;
  }

  React.useEffect(() => {
    console.log('viewTime changed');
    // setRefreshing(true);
    // initializeDayTaskHistoryFromDB(db, defaultTasks, tasks, setTasks, viewTime, () => {
    // console.log(`viewTime initialized tasks for day ${viewTime}`);
    // getTaskHistoryFromDB(db, setTasks, viewTime, () => { setRefreshing(false); });
    // });
    return () => { }
  }, [viewTime]);


  // React.useEffect(() => {
  // console.log('useEffect: getting all tasks from db');
  // getTaskHistoryFromDB(db, (retrievedTasksFromDB: Task[]) => {
  //   if (!retrievedTasksFromDB) {
  //     return;
  //   }
  //   retrievedTasksFromDB.sort((a: Task, b: Task) => a.order - b.order);
  //   setTasks(retrievedTasksFromDB);
  // });
  // return () => { }
  // });

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

  return (
    <View style={styles.container}>
      <View>
        <Text
          style={styles.introductoryText}
          lightColor="rgba(0,0,0,0.8)"
          darkColor="rgba(255,255,255,0.8)">
          Today is going to be a good day.
        </Text>
      </View>
      <View>
        <Text
          style={styles.introductoryText}
          lightColor="rgba(0,0,0,0.8)"
          darkColor="rgba(255,255,255,0.8)">
          You've completed {getCompletedTasksForDay(tasks)}/{tasks.length} tasks.
        </Text>
      </View>
      {
        tasks.map((task: Task, i: number): JSX.Element => {
          return (
            <View style={styles.taskContainer} key={`task-${task.id ? task.id : i}`}>
              <TouchableOpacity onPress={() => { handleTaskPress(db, tasks, setTasks, task, i, viewTime, useForceUpdate); }} style={styles.helpLink}>
                <Text style={styles.taskText} lightColor={Colors[colorScheme].tint}>
                  {task.completed ? <Ionicons style={styles.circleIcon} name="md-checkmark-circle" size={18} color={Colors[colorScheme].success} /> : <Entypo style={styles.circleIcon} name="circle" size={18} color={Colors[colorScheme].text} />}  {task.name}
                </Text>
              </TouchableOpacity>
            </View>
          )
        })
      }
      {
        tasks.length === 0 && (
          <View style={styles.taskContainer}>
            <TouchableOpacity onPress={() => { initializeDayTaskHistoryFromDB(db, defaultTasks, tasks, setTasks, viewTime) }} style={styles.helpLink}>
              <Text style={styles.taskText} lightColor={Colors[colorScheme].tint}>
                There are no entries. Tap here to create fresh tasks for this day.
              </Text>
            </TouchableOpacity>
          </View>
        )
      }

      {
        tasks.length > 0 && (
          <React.Fragment>
            <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
            <View style={styles.taskContainer}>
              <TouchableOpacity onPress={() => { completeAllTasks(db, tasks, setTasks, viewTime, useForceUpdate); }} style={styles.helpLink}>
                <Text style={styles.taskText} lightColor={Colors[colorScheme].tint}>
                  Complete all of today's tasks.
                </Text>
              </TouchableOpacity>
            </View>
            {Platform.OS === 'web' && (<View style={styles.taskContainer}>
              <TouchableOpacity onPress={() => { getTaskHistoryFromDB(db, setTasks, viewTime, useForceUpdate); }} style={styles.helpLink}>
                <Text style={styles.taskText} lightColor={Colors[colorScheme].tint}>
                  Refresh all data.
                </Text>
              </TouchableOpacity>
            </View>)}
            <View style={styles.taskContainer}>
              <TouchableOpacity
                onPress={() => {
                  createTwoButtonAlert(
                    'Are you sure?',
                    `Are you sure you want to delete the data for ${viewTime === getDateInt() ? 'Today' : getSimpleDate(viewTime)}?`,
                    `Yes`,
                    () => {
                      getQueriesWithArgsFromDB(
                        db,
                        [dropTaskHistoryForDaySQL],
                        [[viewTime]],
                        [() => {
                          console.log(`delete day ${viewTime} about to get task history from db`)
                          getTaskHistoryFromDB(db, setTasks, viewTime, useForceUpdate);
                        }]
                      );
                    }
                  )
                }} style={styles.helpLink}>
                <Text style={styles.taskText} lightColor={Colors[colorScheme].tint}>
                  Delete this day's entries.
                </Text>
              </TouchableOpacity>
            </View>
          </React.Fragment>
        )
      }
    </View >
  );
}

// handleTaskPress should update a single entry in the database to reflect the current task value, and then
// only update that task in the react state.
const handleTaskPress = (db: SQLite.WebSQLDatabase, tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>, task: Task, i: number, viewTime: number, useForceUpdate: any): void => {
  const newTasks: Task[] = [];
  tasks.forEach((originalTask: Task, j: number) => {
    if (j === i) {
      const newTask: Task = {
        name: originalTask.name,
        id: originalTask.id,
        completed: !originalTask.completed,
        about: originalTask.about,
        order: originalTask.order,
        link: originalTask.link,
      };
      console.log(`handleTaskPress: pushing task ${task.name} to db`);
      newTasks.push(newTask);
      return;
    }
    newTasks.push(originalTask);
  });
  pushTaskToDB(db, newTasks[i], () => {
    console.log('handleTaskPress pushTaskToDB callback done');
    getTaskHistoryFromDB(db, setTasks, viewTime, useForceUpdate);
  }, viewTime);
}

const completeAllTasks = (db: SQLite.WebSQLDatabase, tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>, viewTime: number, useForceUpdate: any): void => {
  const newTasks: Task[] = tasks.map((originalTask: Task, j: number) => {
    const newTask: Task = {
      name: originalTask.name,
      id: originalTask.id,
      completed: true,
      about: originalTask.about,
      order: originalTask.order,
      link: originalTask.link,
    };
    return newTask;
  });
  newTasks.sort((a: Task, b: Task) => a.order - b.order);
  pushTasksToDB(db, newTasks, () => {
    console.log('completeAllTasks: done');
    getTaskHistoryFromDB(db, setTasks, viewTime, useForceUpdate);
  }, viewTime);
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    maxWidth: "80%",
  },
  circleIcon: {
    paddingRight: 10,
  },
  introductoryText: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  taskContainer: {
    marginTop: 15,
  },
  helpLink: {
    paddingVertical: 15,
  },
  taskText: {
    textAlign: 'left',
  },
  separator: {
    marginTop: 15,
    height: 1,
    width: '80%',
    minWidth: '80%',
  },
});

export default Tasks
