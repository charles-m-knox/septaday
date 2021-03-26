import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import Colors from '../constants/Colors';
import { Text, View } from './Themed';
// import { Ionicons } from '@expo/vector-icons';
// import { Entypo } from '@expo/vector-icons';
import { Task } from '../models/Task';
import * as SQLite from 'expo-sqlite';
import { initializeDB, resetDB } from '../sqlite/sqlite';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, scheduleCalendarPushNotification, schedulePushNotification, setAppBadge } from '../helpers/notifications';

const NotificationControls = ({ db }: {
  db: SQLite.WebSQLDatabase,
}): JSX.Element => {

  const [expoPushToken, setExpoPushToken] = useState('');
  const initialNotification: any = {}; // should technically be of type Notifications.Notification
  const [notification, setNotification] = useState(initialNotification);
  const notificationListener: any = useRef();
  const responseListener: any = useRef();

  const initializeNotifications = () => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      registerForPushNotificationsAsync().then((token?: string) => setExpoPushToken(token ? token : ''));

      notificationListener.current = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
        setNotification(notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
        console.log(response);
      });
    }
  }

  const deinitializeNotifications = () => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    }
  }

  useEffect(() => {
    initializeNotifications();
    return () => {
      deinitializeNotifications();
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
        <TouchableOpacity onPress={async () => { initializeNotifications(); }} style={styles.helpLink}>
          <Text style={styles.helpText} lightColor={Colors.light.tint}>
            Initialize notifications.
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={async () => { await schedulePushNotification(); await scheduleCalendarPushNotification(); }} style={styles.helpLink}>
          <Text style={styles.helpText} lightColor={Colors.light.tint}>
            Test notification.
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={async () => { await scheduleCalendarPushNotification(); }} style={styles.helpLink}>
          <Text style={styles.helpText} lightColor={Colors.light.tint}>
            Test scheduling a daily notification that occurs every day on the next minute of this hour.
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={async () => { await setAppBadge(8); }} style={styles.helpLink}>
          <Text style={styles.helpText} lightColor={Colors.light.tint}>
            Set this app's badge icon to 8.
          </Text>
        </TouchableOpacity>
      </View>
    </View >
  );
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
