import React from 'react';
import { StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Colors from '../constants/Colors';
import { Text, View } from './Themed';
import { Task } from '../models/Task';
import * as WebBrowser from 'expo-web-browser';
import { createTwoButtonAlert } from '../helpers/alerts';

const AboutSection = ({ tasks }: {
  tasks: Task[],
}): JSX.Element => {
  // https://docs.expo.io/versions/v40.0.0/react-native/animated/
  // fadeAnim will be used as the value for opacity. Initial Value: 0
  const fadeAnims: number[] = tasks ? tasks.map(task => 0) : []; // tasks.map((task: Task) => { return React.useRef(new Animated.Value(0)).current; });
  const initialFadeStates: number[] = tasks.map((task: Task) => { return 0 });
  const [fadeStates, setFadeStates] = React.useState(initialFadeStates);

  const fadeToggle = (i: number) => {
    const newFadeStates = [...fadeStates];
    switch (fadeStates[i]) {
      case 0:
        newFadeStates[i] = 1;
        // make the element display immediately
        setFadeStates(newFadeStates);
        // fadeIn(fadeAnims[i], () => { });
        break;
      case 1:
      default:
        // hide the element only after the animation finishes
        // fadeOut(fadeAnims[i], () => {
        newFadeStates[i] = 0;
        setFadeStates(newFadeStates);
        // });
        return;
    }
  }

  const fadeIn = (fadeAnim: Animated.Value, callback?: any) => {
    // will change fadeAnim value to 1 over the below duration
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start(({ finished }) => { callback && callback(finished); });
  };

  const fadeOut = (fadeAnim: Animated.Value, callback?: any) => {
    // will change fadeAnim value to 0 over the below duration
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => { callback && callback(finished); });
  };

  const openURL = (link: string): void => {
    if (!link) return;
    const msg = `Would you like to open the web page ${link} in your browser? This page will provide you with more information about the topic you selected.`;
    createTwoButtonAlert("Open in browser?", msg, "Open", "default", () => { WebBrowser.openBrowserAsync(link); });
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
      <View>
        <Text
          style={[styles.aboutText, { marginTop: 15 }]}
          lightColor="rgba(0,0,0,0.8)"
          darkColor="rgba(255,255,255,0.8)">
          Disclaimer: This app is not a substitute for proper medical and scientific advice from real doctors and professionals. The information presented should be considered anecdotal, and you should follow professional advice from qualified practitioners, scientists, and doctors whenever possible.
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
                  style={[{ /* opacity: fadeAnims[i] */ }]}>
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
    maxWidth: "66%",
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
