import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, RefreshControl, Platform } from 'react-native';
import AboutSection from '../components/About';
import DataControls from '../components/DataControls';
import { Text, View, ScrollView } from '../components/Themed';
import {
  getTaskHistoryFromDB,
  getQueriesFromDB,
} from '../sqlite/sqlite';
import { Task, defaultTasks } from '../models/Task';
import { wait } from '../helpers/helpers';
import BrandView from '../components/Brand';
import Stats from '../components/Stats';
import { useFocusEffect } from '@react-navigation/native';
import NotificationControls from '../components/NotificationControls';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import { getTaskStatsSQL, getTaskDaysSQL } from '../sqlite/queries';
import { getTasksFromDB } from '../sqlite/functions';

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const [tasks, setTasks] = useState(defaultTasks);
  const [refreshing, setRefreshing] = React.useState(false);

  // for stats view
  const initialDates: number[] = [];
  const initialCompletions: number[] = [];

  const [dates, setDates] = React.useState(initialDates);
  const [completions, setCompletions] = React.useState(initialCompletions);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    wait(4000).then(() => setRefreshing(false));
    getTasksFromDB((results: Task[]) => {
      setTasks(results);
      getStats(() => {
        setRefreshing(false);
      });
    });
  }, []);

  // https://css-tricks.com/run-useeffect-only-once/
  React.useEffect(() => {
    getTaskHistoryFromDB((results: Task[]) => { setTasks(results); getStats(); });
    return () => { }
  }, [])

  const getStats = (callback?: any) => {
    getQueriesFromDB(
      [
        getTaskStatsSQL,
        getTaskDaysSQL,
      ],
      [
        (statsResults: number[]) => {
          console.log(`queried: ${JSON.stringify(statsResults)}`);
          setCompletions(
            statsResults.map((statsResult: any): number => {
              return statsResult["completed"];
            })
          );
        },
        (datesResults: number[]) => {
          console.log(`queried: ${JSON.stringify(datesResults)}`);
          setDates(
            datesResults.map((datesResult: any): number => {
              return datesResult["date"];
            })
          );
        },
      ],
      callback,
    )
  }

  useFocusEffect(
    React.useCallback(() => {
      // Do something when the tab is opened
      getTaskHistoryFromDB((results: Task[]) => { setTasks(results); }, 0, () => {
        getStats(() => {
          setRefreshing(false);
        });
      });
      return () => { };
    }, [])
  );

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.container}>
        <Text style={styles.title}>About</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <AboutSection tasks={tasks} setTasks={setTasks} />
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
