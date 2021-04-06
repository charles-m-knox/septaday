import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import Colors from '../constants/Colors';
import { Text, View } from './Themed';

const NotificationControls = (): JSX.Element => {

  return (
    <View style={styles.container}>
      <View>
        <Text
          style={styles.aboutText}
          lightColor="rgba(0,0,0,0.8)"
          darkColor="rgba(255,255,255,0.8)">
          Manage push notifications here. This is a placeholder for future push notification management features that are not implemented yet.
        </Text>
      </View>
      {/* <View style={{ alignItems: 'center', justifyContent: 'center' }}>
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
      </View> */}
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
