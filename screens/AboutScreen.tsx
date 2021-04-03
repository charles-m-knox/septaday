import * as React from 'react';
import { StyleSheet, RefreshControl, Platform } from 'react-native';
import AboutSection from '../components/About';
import DataControls from '../components/DataControls';
import { Text, View, ScrollView } from '../components/Themed';
import {
  doQueriesWithArgsFromDB,
} from '../helpers/sqlite';
import { Task, defaultTasks } from '../models/Task';
import { wait } from '../helpers/helpers';
import BrandView from '../components/Brand';
import Stats from '../components/Stats';
import { useFocusEffect } from '@react-navigation/native';
import NotificationControls from '../components/NotificationControls';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import { getTaskStatsSQL, getTaskDaysSQL } from '../helpers/queries';
import { getTasksFromDB } from '../helpers/functions';

// for stats view
const initialDates: number[] = [];
const initialCompletions: number[] = [];

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const [tasks, setTasks] = React.useState(defaultTasks);
  const [refreshing, setRefreshing] = React.useState(false);
  const [dates, setDates] = React.useState(initialDates);
  const [completions, setCompletions] = React.useState(initialCompletions);
  // const dateCheckerRef: React.MutableRefObject<any> = React.useRef(0);

  const getStats = React.useCallback(() => {
    console.log('AboutScreen getStats: starting');
    setRefreshing(true);
    wait(4000).then(() => setRefreshing(false));
    let isActive = true;
    if (!isActive) return;
    getTasksFromDB(
      (results: Task[]) => {
        setTasks(results);
        doQueriesWithArgsFromDB(
          [getTaskStatsSQL, getTaskDaysSQL], [],
          [
            (statsResults: number[]) => {
              if (!statsResults) return;
              console.log(`AboutScreen getStats queried stats: ${statsResults.length}`);
              setCompletions(
                statsResults.map((statsResult: any): number => {
                  return statsResult["completed"];
                })
              );
            },
            (datesResults: number[]) => {
              if (!datesResults) return;
              console.log(`AboutScreen getStats queried dates: ${datesResults.length}`);
              setDates(
                datesResults.map((datesResult: any): number => {
                  return datesResult["date"];
                })
              );
            },
          ],
          () => { setRefreshing(false); console.log(`AboutScreen getStats: done`); }
        )
      }
    );
    return () => {
      isActive = false;
    }
  }, [
    // tasks,
    // refreshing,
    // dates,
    // completions,
    setTasks,
    setRefreshing,
    setDates,
    setCompletions,
  ])

  // https://reactnavigation.org/docs/use-focus-effect/#running-asynchronous-effects
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      if (!isActive) return;
      getStats();
      // dateCheckerRef.current = setInterval(
      //   () => {
      //     console.log(`about screen date check: ${new Date().getTime()}`);
      //   },
      //   5000
      // );
      return () => {
        // clearInterval(dateCheckerRef.current);
        // dateCheckerRef.current = 0;
        isActive = false;
      }
    }, [])
  );

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={getStats} />}>
      <View style={styles.container}>
        <Text style={styles.title}>About</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <AboutSection tasks={tasks} />
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Stats</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <Stats dates={dates} completions={completions} />
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>App</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <BrandView />
      </View>
      {
        (Platform.OS === "ios" || Platform.OS === "android") && (
          <React.Fragment>
            <View style={styles.container}>
              <Text style={styles.title}>Push Notifications</Text>
              <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
              <NotificationControls />
            </View>
          </React.Fragment>
        )
      }
      <View style={styles.container}>
        <Text style={styles.title}>Data</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <DataControls tasks={tasks} setTasks={setTasks} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
