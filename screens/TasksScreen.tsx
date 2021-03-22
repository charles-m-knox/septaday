import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, RefreshControl, SafeAreaView, } from 'react-native';
import Tasks from '../components/Tasks';
import { Text, View, ScrollView } from '../components/Themed';
import { Task } from '../models/Task';

export default function TasksScreen() {
  const defaultTasks: Task[] = [
    { name: "Consistent Sleep", completed: false, id: "460fa9ba-f190-4018-85ab-dd9a16aa09a4" },
    { name: "Diet", completed: false, id: "80d92035-1256-4ebf-8dfc-fbeefc3e9ecc" },
    { name: "Dental & Physical Hygiene", completed: false, id: "e409699d-119e-4624-9e7d-e74b2659cf31" },
    { name: "Exercise", completed: false, id: "ebe99dac-f8bb-4ca7-be7c-b0f961895ead" },
    { name: "Disconnect 30 minutes (walk)", completed: false, id: "79e2ba1d-734b-4530-aa86-2a20d4acb4c1" },
    { name: "Hour of Focus", completed: false, id: "3629c196-3979-4de0-bff8-f778d98dafb7" },
    { name: "Connect", completed: false, id: "601e3e1f-7c99-4ad6-9e2e-d2a0f4afd66c" },
  ];
  const [tasks, setTasks] = useState(defaultTasks);

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Today</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <Tasks tasks={tasks} setTasks={setTasks} />
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
