import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { defaultTasks, Task } from '../models/Task';
import Colors from '../constants/Colors';
import { Text, View } from './Themed';
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import {
  getTaskHistoryFromDB,
  initializeDayTaskHistoryFromDB,
  pushTasksToDB,
  pushTaskToDB
} from '../sqlite/sqlite';
import useColorScheme from '../hooks/useColorScheme';
import { setAppBadgeForTodayTasks } from '../helpers/notifications';
import { getDateInt, getHumanDate } from '../helpers/helpers';
import { createTwoButtonAlert } from '../helpers/alerts';
import { deleteDayTasks, getTasksFromDB, updateTask } from '../sqlite/functions';

const Tasks = ({ tasks, setTasks, viewTime }: {
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  viewTime: number,
}): JSX.Element => {
  const colorScheme = useColorScheme();

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
    return () => { }
  }, [viewTime]);

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
              <TouchableOpacity onPress={() => { handleTaskPress(setTasks, task, viewTime); }} style={styles.helpLink}>
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
            <TouchableOpacity onPress={() => { initializeDayTaskHistoryFromDB(defaultTasks, tasks, (results: Task[]) => { setTasks(results); }, viewTime) }} style={styles.helpLink}>
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
              <TouchableOpacity onPress={() => { completeAllTasks(tasks, setTasks, viewTime); }} style={styles.helpLink}>
                <Text style={styles.taskText} lightColor={Colors[colorScheme].tint}>
                  Complete all of today's tasks.
                </Text>
              </TouchableOpacity>
            </View>
            {Platform.OS === 'web' && (<View style={styles.taskContainer}>
              <TouchableOpacity onPress={() => { getTasksFromDB((results: Task[]) => { setTasks(results); }, viewTime); }} style={styles.helpLink}>
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
                    `Are you sure you want to delete the data for ${viewTime === getDateInt() ? 'Today' : getHumanDate(viewTime, false)}?`,
                    `Yes`,
                    'destructive',
                    () => {
                      deleteDayTasks(
                        () => {
                          getTasksFromDB((results: Task[]) => { setTasks(results); },
                            viewTime);
                        },
                        viewTime,
                      )
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
const handleTaskPress = (setTasks: React.Dispatch<React.SetStateAction<Task[]>>, task: Task, viewTime: number): void => {
  updateTask(
    { ...task, completed: !task.completed },
    () => { getTasksFromDB((results: Task[]) => { results && setTasks(results); }, viewTime) },
    viewTime,
  );
}

const completeAllTasks = (tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>, viewTime: number): void => {
  const newTasks: Task[] = tasks.map((originalTask: Task, j: number) => {
    const newTask: Task = { ...originalTask, completed: true, };
    return newTask;
  });
  newTasks.sort((a: Task, b: Task) => a.order - b.order);
  pushTasksToDB(newTasks, () => {
    console.log('completeAllTasks: done');
    getTasksFromDB(
      (results: Task[]) => {
        setTasks(results);
        setAppBadgeForTodayTasks(results, viewTime);
      },
      viewTime,
    );
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
