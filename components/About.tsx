import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../constants/Colors';
import { Text, View } from './Themed';
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { Task } from '../models/Task';

const AboutSection = ({ tasks, setTasks }: {
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
          You have a better chance at leading a healthy, successful life if you accomplish a routine set of tasks. These 7 tasks will help you form the basis for a disciplined, daily routine that will very likely shape you into a better person.
        </Text>
      </View>
      {
        tasks.map((task: Task, i: number): JSX.Element => {
          return (
            <View style={styles.taskContainer} key={`task-${task.id}`}>
              <TouchableOpacity onPress={() => { /* handleTaskPress(tasks, setTasks, task, i);  */ }} style={styles.helpLink}>
                <Text style={styles.taskTextBold} lightColor={Colors.light.tint}>
                  {task.name}
                </Text>
                <Text style={styles.taskText} lightColor={Colors.light.tint}>
                  {task.about}
                </Text>
              </TouchableOpacity>
            </View>
          )
        })
      }
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    maxWidth: "66%",
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
  },
  helpLink: {
    paddingVertical: 15,
  },
  aboutText: {
    textAlign: 'left',
  },
  taskText: {
    textAlign: 'left',
  },
  taskTextBold: {
    textAlign: 'left',
    fontWeight: 'bold',
  },
});

export default AboutSection;
