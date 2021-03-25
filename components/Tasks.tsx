import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '../models/Task';
import Colors from '../constants/Colors';
import { Text, View } from './Themed';
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import { getTaskHistoryFromDB, initializeDB, pushTasksToDB, pushTaskToDB, resetDB } from '../sqlite/sqlite';
import useColorScheme from '../hooks/useColorScheme';

const Tasks = ({ tasks, setTasks, db }: {
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  db: SQLite.WebSQLDatabase,
}): JSX.Element => {
  const colorScheme = useColorScheme();

  const useForceUpdate = () => {
    console.log("useForceUpdate called");
    // const [value, setValue] = useState(0);
    // return [() => setValue(value + 1), value];
  }
  // const [forceUpdate, forceUpdateId] = useForceUpdate();

  const getCompletedTasksForToday = (allTasks: Task[]): number => {
    let result = 0;
    allTasks.forEach((task: Task) => {
      if (task.completed === true) {
        result += 1;
      }
    });
    return result;
  }

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
          You've completed {getCompletedTasksForToday(tasks)}/{tasks.length} tasks.
        </Text>
      </View>
      {
        tasks.map((task: Task, i: number): JSX.Element => {
          return (
            <View style={styles.taskContainer} key={`task-${task.id ? task.id : i}`}>
              <TouchableOpacity onPress={() => { handleTaskPress(db, tasks, setTasks, task, i, useForceUpdate); }} style={styles.helpLink}>
                <Text style={styles.taskText} lightColor={Colors[colorScheme].tint}>
                  {task.completed ? <Ionicons style={styles.circleIcon} name="md-checkmark-circle" size={18} color={Colors[colorScheme].success} /> : <Entypo style={styles.circleIcon} name="circle" size={18} color={Colors[colorScheme].text} />}  {task.name}
                </Text>
              </TouchableOpacity>
            </View>
          )
        })
      }

      <View style={styles.taskContainer}>
        <TouchableOpacity onPress={() => { completeAllTasks(db, tasks, setTasks, useForceUpdate); }} style={styles.helpLink}>
          <Text style={styles.taskText} lightColor={Colors[colorScheme].tint}>
            Complete all of today's tasks.
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.taskContainer}>
        <TouchableOpacity onPress={() => { getTaskHistoryFromDB(db, setTasks, 0, useForceUpdate); }} style={styles.helpLink}>
          <Text style={styles.taskText} lightColor={Colors[colorScheme].tint}>
            Refresh all data.
          </Text>
        </TouchableOpacity>
      </View>
    </View >
  );
}

// handleTaskPress should update a single entry in the database to reflect the current task value, and then
// only update that task in the react state.
const handleTaskPress = (db: SQLite.WebSQLDatabase, tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>, task: Task, i: number, useForceUpdate: any): void => {
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
    getTaskHistoryFromDB(db, setTasks, 0, useForceUpdate);
  });
}

const completeAllTasks = (db: SQLite.WebSQLDatabase, tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>, useForceUpdate: any): void => {
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
    getTaskHistoryFromDB(db, setTasks, 0, useForceUpdate);
  });
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
});

export default Tasks
