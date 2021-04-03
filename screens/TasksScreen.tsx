import * as React from 'react';
import { StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Tasks from '../components/Tasks';
import { Text, View, ScrollView } from '../components/Themed';
import { Task, defaultTasks } from '../models/Task';
import { getDateInt, getHumanDate, getOffsetDaysFromInt, wait } from '../helpers/helpers';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import { useFocusEffect } from '@react-navigation/native';
import { getTasksFromDB, initializeDB } from '../helpers/functions';
import { setAppBadge } from '../helpers/notifications';

const TasksScreen = (): JSX.Element => {
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = React.useState(false);
  const [tasks, setTasks] = React.useState(defaultTasks);
  const [viewTime, setViewTime] = React.useState(getDateInt());

  const onRefresh = React.useCallback(() => {
    console.log(`onRefresh: refreshing for ${viewTime} (${getHumanDate(viewTime)})`);
    setRefreshing(true);
    wait(4000).then(() => setRefreshing(false));
    getTasksFromDB(
      (results: Task[]) => {
        setTasks(results);
        setRefreshing(false);
      },
      viewTime,
    );
  }, [viewTime]);

  // https://css-tricks.com/run-useeffect-only-once/
  React.useEffect(() => {
    setRefreshing(true);
    wait(4000).then(() => setRefreshing(false));
    initializeDB(
      () => {
        getTasksFromDB((results: Task[]) => {
          setTasks(results);
          setRefreshing(false);
        });
      },
    );
    return () => { }
  }, []);

  React.useEffect(() => {
    console.log('tasks screen: viewTime changed');
    setRefreshing(true);
    wait(4000).then(() => setRefreshing(false));
    getTasksFromDB(
      (results: Task[]) => {
        setTasks(results);
        setRefreshing(false);
      },
      viewTime,
    );
    return () => { }
  }, [viewTime]);

  React.useEffect(() => {
    console.log('tasks screen: tasks changed');
    if (viewTime === getDateInt()) {
      const tasksIncomplete = tasks.reduce((acc: number, current: Task): number => acc + (current.completed ? 0 : 1), 0);
      console.log(`tasks updated, incomplete tasks for today: ${tasksIncomplete}`);
      setAppBadge(tasksIncomplete);
    }
    return () => { }
  }, [tasks]);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     // Do something when the tab is opened
  //     let isActive = true;
  //     if (!isActive) return;
  //     console.log('tasks screen: focused');
  //     setRefreshing(true);
  //     wait(4000).then(() => setRefreshing(false));
  //     getTasksFromDB(
  //       (results: Task[]) => {
  //         setTasks(results);
  //         setRefreshing(false);
  //       },
  //       viewTime,
  //     );
  //     return () => {
  //       isActive = false;
  //     }
  //   }, [viewTime])
  // );

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
            <Ionicons style={[]} name="chevron-back" size={32} color={Colors[colorScheme].iconDim} />
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
            <Ionicons style={[]} name="chevron-forward" size={32} color={Colors[colorScheme].iconDim} />
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
