import React, { useState, useRef, useEffect } from 'react';
import Constants from 'expo-constants';
import { StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import Colors from '../constants/Colors';
import { Text, View } from './Themed';
// import { Ionicons } from '@expo/vector-icons';
// import { Entypo } from '@expo/vector-icons';
import { Task } from '../models/Task';
import * as SQLite from 'expo-sqlite';
import { initializeDB, resetDB } from '../sqlite/sqlite';
import * as Notifications from 'expo-notifications';
import { Subscription } from '@unimodules/core';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

const NotificationControls = ({ db }: {
  db: SQLite.WebSQLDatabase,
}): JSX.Element => {

  const [expoPushToken, setExpoPushToken] = useState('');
  const initialNotification: any = {}; // should technically be of type Notifications.Notification
  const [notification, setNotification] = useState(initialNotification);
  const notificationListener: any = useRef();
  const responseListener: any = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token?: string) => setExpoPushToken(token ? token : ''));

    notificationListener.current = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View>
        <Text
          style={styles.aboutText}
          lightColor="rgba(0,0,0,0.8)"
          darkColor="rgba(255,255,255,0.8)">
          Manage push notifications here.
        </Text>
      </View>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Your expo push token: {expoPushToken}</Text>
        <Text>Title: {notification && notification.request && notification.request.content && notification.request.content.title} </Text>
        <Text>Body: {notification && notification.request && notification.request.content && notification.request.content.body}</Text>
        <Text>Data: {notification && notification.request && notification.request.content && JSON.stringify(notification.request.content.data)}</Text>
      </View>
      <View>
        <TouchableOpacity onPress={async () => { await schedulePushNotification(); }} style={styles.helpLink}>
          <Text style={styles.helpText} lightColor={Colors.light.tint}>
            Test notification.
          </Text>
        </TouchableOpacity>
      </View>
    </View >
  );
}

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: 'Here is the notification body',
      data: { data: 'goes here' },
    },
    trigger: { seconds: 2 },
  });
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

const styles = StyleSheet.create({
  container: {
    maxWidth: "66%",
    width: "66%",
  },
  aboutText: {
    textAlign: 'left',
  },
  actionContainer: {
    marginTop: 15,
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpText: {
    textAlign: 'left',
  },
});

export default NotificationControls;
