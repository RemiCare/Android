import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const CHANNELS = [
  { id: "emergency-grade-1", name: "긴급 응급 알림", importance: Notifications.AndroidImportance.MAX },
  { id: "warning-grade-2",   name: "주의 경고 알림", importance: Notifications.AndroidImportance.HIGH },
  { id: "notice-grade-3",    name: "일반 건강 알림", importance: Notifications.AndroidImportance.DEFAULT },
];

export async function registerExpoPushToken() {
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return null;

  if (Platform.OS === "android") {
    for (const ch of CHANNELS) {
      await Notifications.setNotificationChannelAsync(ch.id, {
        name: ch.name,
        importance: ch.importance,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
  }

  const projectId =
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.expoConfig?.extra?.projectId;

  const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  return token.data; // "ExponentPushToken[xxx...]"
}

// 하위 호환용 alias
export const registerFcmToken = registerExpoPushToken;

export function useNotificationListener() {
  const responseListener = useRef();

  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {});
    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);
}
