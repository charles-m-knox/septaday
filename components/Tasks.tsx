import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '../models/Task';
import Colors from '../constants/Colors';
import { Text, View } from './Themed';
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';

const Tasks = ({ tasks, setTasks }: {
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
}): JSX.Element => {

  const getCompletedTasksForToday = (allTasks: Task[]): number => {
    let result = 0;
    allTasks.forEach((task: Task) => {
      if (task.completed === true) {
        result += 1;
      }
    });
    return result;
  }

  return (
    <View style={styles.container}>
      <View>
        <Text
          style={styles.introductoryText}
          lightColor="rgba(0,0,0,0.8)"
          darkColor="rgba(255,255,255,0.8)">
          Today is going to be a good day. You've completed {getCompletedTasksForToday(tasks)}/{tasks.length} tasks.
        </Text>
      </View>
      {
        tasks.map((task: Task, i: number): JSX.Element => {
          return (
            <View style={styles.taskContainer} key={`task-${task.id}`}>
              <TouchableOpacity onPress={() => { handleTaskPress(tasks, setTasks, task, i); }} style={styles.helpLink}>
                <Text style={styles.taskText} lightColor={Colors.light.tint}>
                  {task.completed ? <Ionicons style={styles.circleIcon} name="md-checkmark-circle" size={24} color="green" /> : <Entypo style={styles.circleIcon} name="circle" size={24} color="black" />}
                  {task.name}
                </Text>
              </TouchableOpacity>
            </View>
          )
        })
      }

      <View style={styles.taskContainer}>
        <TouchableOpacity onPress={() => { completeAllTasks(tasks, setTasks); }} style={styles.helpLink}>
          <Text style={styles.taskText} lightColor={Colors.light.tint}>
            Complete all of today's tasks.
          </Text>
        </TouchableOpacity>
      </View>
    </View >
  );
}

const handleTaskPress = (tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>, task: Task, i: number): void => {
  const newTasks: Task[] = tasks.map((originalTask: Task, j: number) => {
    if (j === i) {
      const newTask: Task = {
        name: originalTask.name,
        id: originalTask.id,
        completed: !originalTask.completed,
      };
      return newTask;
    }
    return originalTask;
  });
  setTasks(newTasks);
  console.log(`toggled task ${task.name} id ${task.id}, i=${i}!`);
}

const completeAllTasks = (tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>): void => {
  const newTasks: Task[] = tasks.map((originalTask: Task) => {
    originalTask.completed = true;
    return originalTask;
  });

  setTasks(newTasks);
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  circleIcon: {
    paddingRight: 10,
  },
  // developmentModeText: {
  //   marginBottom: 20,
  //   fontSize: 14,
  //   lineHeight: 19,
  //   textAlign: 'center',
  // },
  // contentContainer: {
  //   paddingTop: 30,
  // },
  // welcomeImage: {
  //   width: 100,
  //   height: 80,
  //   resizeMode: 'contain',
  //   marginTop: 3,
  //   marginLeft: -10,
  // },
  introductoryText: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  taskContainer: {
    marginTop: 15,
    // marginHorizontal: 0,
    // marginHorizontal: 20,
    // alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  taskText: {
    textAlign: 'left',
  },
});

export default Tasks
