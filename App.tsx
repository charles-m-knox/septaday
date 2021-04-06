import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

import { registerForPushNotificationsAsync, scheduleCalendarPushNotification, schedulePushNotification, setAppBadge } from './helpers/notifications';
import * as Notifications from 'expo-notifications';

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  const [expoPushToken, setExpoPushToken] = React.useState('');
  const initialNotification: any = {}; // should technically be of type Notifications.Notification
  const [notification, setNotification] = React.useState(initialNotification);
  const notificationListener: any = React.useRef();
  const responseListener: any = React.useRef();

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

  React.useEffect(() => {
    initializeNotifications();
    return () => {
      deinitializeNotifications();
    };
  }, []);


  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} />
        <StatusBar />
      </SafeAreaProvider>
    );
  }
}
