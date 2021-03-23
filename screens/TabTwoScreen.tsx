import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import AboutSection from '../components/About';
import DataControls from '../components/DataControls';
import { Text, View } from '../components/Themed';
import Colors from '../constants/Colors';
import * as SQLite from 'expo-sqlite';
import { getDB, getTaskHistoryFromDB } from '../sqlite/sqlite';
import { Task, defaultTasks } from '../models/Task';
import { wait } from '../helpers/helpers';

export default function TabTwoScreen() {
  let db: SQLite.WebSQLDatabase = getDB();
  const [tasks, setTasks] = useState(defaultTasks);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    wait(4000).then(() => setRefreshing(false));
    getTaskHistoryFromDB(db, setTasks);
  }, []);

  // https://css-tricks.com/run-useeffect-only-once/
  React.useEffect(() => {
    getTaskHistoryFromDB(db, setTasks);
    return () => { }
  }, [])

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.container}>
        <Text style={styles.title}>About</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <AboutSection db={db} tasks={tasks} setTasks={setTasks} />
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Data</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <DataControls db={db} tasks={tasks} setTasks={setTasks} />
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
