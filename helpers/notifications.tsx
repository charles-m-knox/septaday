import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task } from '../models/Task';
import { getDateInt } from './helpers';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: true,
    }),
});

export async function schedulePushNotification() {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Septaday",
            body: 'Here is the notification body',
            data: { data: 'goes here' },
            badge: 7,
            vibrate: [1],
        },
        trigger: { seconds: 2 },
    });
}

export async function scheduleCalendarPushNotification() {
    const d = new Date();
    const calTriggerOpts: Notifications.CalendarNotificationTrigger = {
        repeats: true,
        type: 'calendar',
        dateComponents: {
            isLeapMonth: false,
            hour: d.getHours(),
            minute: d.getMinutes() + 1,
        }
    };
    // const dailyTrigger: Notifications.DailyTriggerInput = {
    //     hour: 9,
    //     minute: 26,
    //     repeats: true,
    // }
    console.log(`scheduling calendar trigger ${JSON.stringify(calTriggerOpts)}`);
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Septaday",
            body: 'Here is the notification body',
            badge: 7,
            vibrate: [1],
        },
        trigger: calTriggerOpts,
    }).then((response: string) => {
        console.log(`scheduleCalendarPushNotification response: ${response}`)
    }).catch((error: string) => {
        console.error(`scheduleCalendarPushNotification error: ${error}`)
    });
}

export const setAppBadgeForTodayTasks = (todayTasks: Task[], currentViewTime: number) => {
    const nowTime = getDateInt();
    console.log(`setAppBadgeForTodayTasks: ${currentViewTime} vs ${nowTime}`);
    if (currentViewTime !== nowTime || (Platform.OS !== "ios" && Platform.OS !== "android")) return;
    let result = 0;
    todayTasks.forEach((task: Task) => {
        if (task.completed === false) {
            result += 1;
        }
    });
    console.log(`setAppBadgeForTodayTasks: ${result}`);
    Notifications.setBadgeCountAsync(result);
}

export const setAppBadge = async (count: number) => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
        console.log(`setAppBadge to ${count}`);
        await Notifications.setBadgeCountAsync(count);
    }
}

export async function registerForPushNotificationsAsync() {
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