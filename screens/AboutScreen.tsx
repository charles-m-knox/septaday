import * as React from 'react';
import { StyleSheet, RefreshControl, /* Platform */ } from 'react-native';
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
// import NotificationControls from '../components/NotificationControls';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import { getTaskStatsSQL, getTaskDaysSQL } from '../helpers/queries';
import { getTasksFromDB } from '../helpers/functions';

// for stats view
const initialDates: number[] = [];
const initialCompletions: number[] = [];

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const [isVisible, setIsVisible] = React.useState(false);

  const [tasks, setTasks] = React.useState(defaultTasks);
  const [refreshing, setRefreshing] = React.useState(false);
  const [dates, setDates] = React.useState(initialDates);
  const [completions, setCompletions] = React.useState(initialCompletions);

  const getStats = React.useCallback(() => {
    console.log('AboutScreen getStats: starting');
    setRefreshing(true);
    wait(4000).then(() => setRefreshing(false));
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
      setRefreshing(false);
      setDates([]);
      setTasks([]);
    }
  }, [])

  // https://reactnavigation.org/docs/use-focus-effect/#running-asynchronous-effects
  useFocusEffect(
    React.useCallback(() => {
      if (!isVisible) setIsVisible(true);
      getStats();
      return () => {
        console.log('about screen: cleanup');
        setIsVisible(false);
        setRefreshing(false);
        setDates([]);
        setTasks([]);
      }
    }, [])
  );

  return (
    <>
      {
        isVisible ? ( // https://corstianboerman.com/2020-09-05/force-a-component-to-unmount-with-react-navigation.md.html
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
            {/* {
              (Platform.OS === "ios" || Platform.OS === "android") && (
                <React.Fragment>
                  <View style={styles.container}>
                    <Text style={styles.title}>Push Notifications</Text>
                    <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
                    <NotificationControls />
                  </View>
                </React.Fragment>
              )
            } */}
            <View style={styles.container}>
              <Text style={styles.title}>Data</Text>
              <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
              <DataControls tasks={tasks} setTasks={setTasks} />
            </View>
          </ScrollView>
        ) : (
          <View style={styles.container}>
            {/* left empty intentionally */}
          </View>
        )
      }
    </>
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
