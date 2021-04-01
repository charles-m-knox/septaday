import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Tasks from '../components/Tasks';
import { Text, View, ScrollView } from '../components/Themed';
import { Task, defaultTasks } from '../models/Task';
import { initializeDB } from '../sqlite/sqlite';
import { getDateInt, getHumanDate, getOffsetDaysFromInt, wait } from '../helpers/helpers';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import { setAppBadgeForTodayTasks } from '../helpers/notifications';
import { useFocusEffect } from '@react-navigation/native';
import { getTasksFromDB } from '../sqlite/functions';

const TasksScreen = (): JSX.Element => {
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = React.useState(false);
  const [tasks, setTasks] = useState(defaultTasks);
  const [viewTime, setViewTime] = useState(getDateInt());

  const onRefresh = React.useCallback(() => {
    refreshForTime();
  }, [viewTime]);

  const refreshForTime = () => {
    setRefreshing(true);
    wait(4000).then(() => setRefreshing(false));
    console.log(`onRefresh: refreshing for ${viewTime} (${getHumanDate(viewTime)})`);
    getTasksFromDB(
      (results: Task[]) => {
        setTasks(results);
        setAppBadgeForTodayTasks(results, viewTime);
        setRefreshing(false);
      },
      viewTime,
    );
  }

  // https://css-tricks.com/run-useeffect-only-once/
  React.useEffect(() => {
    setRefreshing(true);
    initializeDB(tasks, (initResults: Task[]) => { },
      () => {
        getTasksFromDB((results: Task[]) => {
          setTasks(results);
          setAppBadgeForTodayTasks(results, getDateInt());
          setRefreshing(false);
        });
      });
    return () => { }
  }, []);

  React.useEffect(() => {
    console.log('viewTime changed');
    setRefreshing(true);
    getTasksFromDB(
      (results: Task[]) => {
        setTasks(results);
        setRefreshing(false);
        setAppBadgeForTodayTasks(results, viewTime);
      },
      viewTime,
    );
    return () => { }
  }, [viewTime]);

  useFocusEffect(
    React.useCallback(() => {
      // Do something when the tab is opened
      return () => { };
    }, [])
  );

  return (
    <View style={styles.container}>
      <ScrollView style={[{ maxHeight: '92%', minWidth: '100%' }]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.container}>
          {/* <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" /> */}
          <Tasks tasks={tasks} setTasks={setTasks} viewTime={viewTime} />
        </View >
      </ScrollView>
      <View style={styles.separatorThin} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <View style={[styles.titleContainer, { maxHeight: '8%' }]}>
        <TouchableOpacity onPress={() => {
          const newViewTime = getOffsetDaysFromInt(viewTime, -1);
          setViewTime(newViewTime);
        }} >
          <Text style={styles.iconArrowDate}>
            <Ionicons style={[]} name="arrow-back-circle" size={32} color={Colors[colorScheme].iconDim} />
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          const newViewTime = getDateInt();
          setViewTime(newViewTime);
        }} >
          <Text style={styles.title}>{viewTime === getDateInt() ? 'Today' : getHumanDate(viewTime, false)}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          const newViewTime = getOffsetDaysFromInt(viewTime, 1);
          setViewTime(newViewTime);
        }} >
          <Text style={styles.iconArrowDate}>
            <Ionicons style={[]} name="arrow-forward-circle" size={32} color={Colors[colorScheme].iconDim} />
          </Text>
        </TouchableOpacity>
      </View>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 10
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  iconArrowDate: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 30,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  separatorThin: {
    height: 1,
    width: '100%',
  },
});

export default TasksScreen;
