import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, RefreshControl, SafeAreaView, } from 'react-native';
import Tasks from '../components/Tasks';
import { Text, View, ScrollView } from '../components/Themed';
import { Task, defaultTasks } from '../models/Task';
import * as SQLite from 'expo-sqlite';
import { getDB, getTaskHistoryFromDB, initializeDB } from '../sqlite/sqlite';

export default function TasksScreen(): JSX.Element {
  let db: SQLite.WebSQLDatabase = getDB();

  const [retrievedInitialTasks, setRetrievedInitialTasks] = useState(false);

  // start by retrieving the tasks from sqlite
  const [tasks, setTasks] = useState(defaultTasks);

  // https://css-tricks.com/run-useeffect-only-once/
  React.useEffect(() => {
    initializeDB(db);
    getTaskHistoryFromDB(db, (retrievedTasks: Task[]) => {
      if (!retrievedInitialTasks) {
        setTasks(retrievedTasks);
        setRetrievedInitialTasks(true);
      }
    })
    return () => { }
  }, [])

  return (
    <ScrollView>
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
