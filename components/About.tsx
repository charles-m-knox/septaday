import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../constants/Colors';
import { Text, View } from './Themed';
import { Task } from '../models/Task';
import * as WebBrowser from 'expo-web-browser';
import { createTwoButtonAlert } from '../helpers/alerts';

const AboutSection = ({ tasks }: {
  tasks: Task[],
}): JSX.Element => {
  const initialSectionStates: number[] = tasks.map((task: Task) => { return 0 });
  const [sectionVisibilityStates, setSectionVisibilityStates] = React.useState(initialSectionStates);

  const fadeToggle = (i: number) => {
    const newFadeStates = [...sectionVisibilityStates];
    switch (sectionVisibilityStates[i]) {
      case 0:
        newFadeStates[i] = 1;
        // make the element display immediately
        setSectionVisibilityStates(newFadeStates);
        break;
      case 1:
      default:
        // hide the element only after the animation finishes
        newFadeStates[i] = 0;
        setSectionVisibilityStates(newFadeStates);
        return;
    }
  }

  const openURL = (link: string): void => {
    if (!link) return;
    const msg = `Would you like to open the web page ${link} in your browser? This page will provide you with more information about the topic you selected.`;
    createTwoButtonAlert("Open in browser?", msg, "Open", "default", () => { WebBrowser.openBrowserAsync(link); });
  }

  React.useEffect(() => {
    console.log(`about component: tasks changed`);
    setSectionVisibilityStates(tasks.map((task: Task) => { return 0 }));
    return () => {
      console.log(`about component: tasks cleaning up`);
      setSectionVisibilityStates([]);
    }
  }, [tasks])

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
                <View
                  style={[{}]}>
                  <Text style={[styles.taskText, !sectionVisibilityStates[i] && { display: 'none' }]} lightColor={Colors.light.tint}>
                    {task.about}
                  </Text>
                  <Text style={[styles.taskTextLink, !sectionVisibilityStates[i] && { display: 'none' }]} lightColor={Colors.light.tint}>
                    For more info, long-press here to visit {task.link}.
                  </Text>
                </View>
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
