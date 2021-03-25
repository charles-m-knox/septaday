import React from 'react';
import { StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Colors from '../constants/Colors';
import { Text, View } from './Themed';
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { Task } from '../models/Task';
import * as SQLite from 'expo-sqlite';
import * as WebBrowser from 'expo-web-browser';

const AboutSection = ({ db, tasks, setTasks }: {
  db: SQLite.WebSQLDatabase,
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
}): JSX.Element => {

  // https://docs.expo.io/versions/v40.0.0/react-native/animated/
  // fadeAnim will be used as the value for opacity. Initial Value: 0
  const fadeAnims = tasks.map((task: Task) => { return React.useRef(new Animated.Value(0)).current; });
  const initialFadeStates: number[] = tasks.map((task: Task) => { return 0 });
  const [fadeStates, setFadeStates] = React.useState(initialFadeStates);

  const fadeToggle = (i: number) => {
    switch (fadeStates[i]) {
      case 0:
        // make the element displayed immediately
        setFadeStates(
          fadeStates.map((fadeState: number, j: number) => {
            if (i === j) return 1;
            return fadeState
          })
        );
        fadeIn(fadeAnims[i], () => { });
        break;
      case 1:
      default:
        // hide the element only after the animation finishes
        fadeOut(fadeAnims[i], () => {
          setFadeStates(
            fadeStates.map((fadeState: number, j: number) => {
              if (i === j) return 0;
              return fadeState
            })
          )
        });
        return;
    }
  }

  const fadeIn = (fadeAnim: Animated.Value, callback: any) => {
    // will change fadeAnim value to 1 in 5 seconds
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start(({ finished }) => { callback(finished); });
  };

  const fadeOut = (fadeAnim: Animated.Value, callback: any) => {
    // will change fadeAnim value to 0 in 5 seconds
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => { callback(finished); });
  };

  const openURL = (link: string): void => {
    if (!link) return;
    WebBrowser.openBrowserAsync(link);
  }

  return (
    <View style={styles.container}>
      <View>
        <Text
          style={styles.aboutText}
          lightColor="rgba(0,0,0,0.8)"
          darkColor="rgba(255,255,255,0.8)">
          You have a better chance at leading a healthy, successful life if you accomplish an easy, routine set of tasks every day. These 7 tasks will help you form the basis for a disciplined, daily routine that will very likely shape you into a better person.
        </Text>
      </View>
      {
        tasks.map((task: Task, i: number): JSX.Element => {
          return (
            <View style={styles.taskContainer} key={`task-about-${task.id ? task.id : i}`}>
              <TouchableOpacity onLongPress={() => { openURL(task.link); }} onPress={() => { fadeToggle(i); }} style={styles.helpLink}>
                <Text style={styles.taskTextBold} lightColor={Colors.light.tint}>
                  More on: {task.name}
                </Text>
                <Animated.View
                  style={[{ opacity: fadeAnims[i] }]}>
                  <Text style={[styles.taskText, !fadeStates[i] && { display: 'none' }]} lightColor={Colors.light.tint}>
                    {task.about}
                  </Text>
                  <Text style={[styles.taskTextLink, !fadeStates[i] && { display: 'none' }]} lightColor={Colors.light.tint}>
                    For more info, long-press here to visit {task.link}.
                  </Text>
                </Animated.View>
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
    // paddingHorizontal: 24,
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
  taskTextLink: {
    textAlign: 'left',
    marginTop: 15,
  },
  taskTextBold: {
    textAlign: 'left',
    fontWeight: 'bold',
  },
});

export default AboutSection;
