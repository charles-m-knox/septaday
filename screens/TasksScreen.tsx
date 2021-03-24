import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, RefreshControl, } from 'react-native';
import Tasks from '../components/Tasks';
import { Text, View, ScrollView } from '../components/Themed';
import { Task, defaultTasks } from '../models/Task';
import * as SQLite from 'expo-sqlite';
import { getDB, getTaskHistoryFromDB, initializeDB } from '../sqlite/sqlite';
import { wait } from '../helpers/helpers';

export default function TasksScreen(): JSX.Element {
  let db: SQLite.WebSQLDatabase = getDB();
  const [refreshing, setRefreshing] = React.useState(false);
  const [tasks, setTasks] = useState(defaultTasks);
  const [retrievedInitialTasks, setRetrievedInitialTasks] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    wait(4000).then(() => setRefreshing(false));
    getTaskHistoryFromDB(db, setTasks, () => { setRefreshing(false); });
  }, []);

  // https://css-tricks.com/run-useeffect-only-once/
  React.useEffect(() => {
    initializeDB(db, tasks, setTasks, () => { getTaskHistoryFromDB(db, setTasks); });
    return () => { }
  }, []);

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.container}>
        <Text style={styles.title}>Today</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <Tasks tasks={tasks} setTasks={setTasks} db={db} />
      </View >
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
