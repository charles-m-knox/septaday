import { Ionicons, AntDesign } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import TasksScreen from '../screens/TasksScreen';
import TabTwoScreen from '../screens/TabTwoScreen';
import { BottomTabParamList, TasksScreenParamList as TasksScreenParamList, TabTwoParamList } from '../types';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="TasksScreen"
      tabBarOptions={{ activeTintColor: Colors[colorScheme].tint }}>
      <BottomTab.Screen
        name="TasksScreen"
        component={TasksScreenNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="md-checkmark-circle" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="TabTwo"
        component={TabTwoNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="ellipsis-horizontal-circle-sharp" color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
const TabBarIcon = (props: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }): JSX.Element => {
  return <Ionicons size={30} style={{ marginBottom: 3 }} {...props} />;
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
const TasksScreenStack = createStackNavigator<TasksScreenParamList>();

const TasksScreenNavigator = (): JSX.Element => {
  return (
    <TasksScreenStack.Navigator>
      <TasksScreenStack.Screen
        name="TasksScreen"
        component={TasksScreen}
        options={{ headerTitle: 'Tasks' }}
      />
    </TasksScreenStack.Navigator>
  );
}

const TabTwoStack = createStackNavigator<TabTwoParamList>();

const TabTwoNavigator = (): JSX.Element => {
  return (
    <TabTwoStack.Navigator>
      <TabTwoStack.Screen
        name="TabTwoScreen"
        component={TabTwoScreen}
        options={{ headerTitle: 'About' }}
      />
    </TabTwoStack.Navigator>
  );
}