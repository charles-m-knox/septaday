import { Alert, AlertButton, Platform } from 'react-native';

export const createTwoButtonAlert = (title: string, message: string, action: string, style: AlertButton["style"], callback?: any,): void => {
    if (Platform.OS === "web") {
        if (confirm(message)) {
            callback();
        }
    } else {
        Alert.alert(
            title,
            message,
            [
                { text: "Cancel", onPress: () => { }, style: "cancel" },
                { text: action, onPress: () => { callback(); }, style: style }
            ],
            { cancelable: false }
        );
    }
}

export const createOneButtonAlert = (title: string, message: string, action: string, style: AlertButton["style"], callback?: any,): void => {
    if (Platform.OS === "web") {
        alert(message);
    } else {
        Alert.alert(
            title,
            message,
            [{ text: action, onPress: () => { callback && callback(); }, style: style }],
            { cancelable: false }
        );
    }
}