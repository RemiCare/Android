import { useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { BASE_URL } from "../constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerPushTokenToBackend(expoPushToken, userId) {
  console.log("[PUSH] 백엔드 등록 요청:", {
    userId,
    expoPushToken,
    platform: Platform.OS,
    deviceName: Device.deviceName ?? "unknown",
  });

  const response = await fetch(`${BASE_URL}/api/alarm/push-token/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      expoPushToken,
      platform: Platform.OS,
      deviceName: Device.deviceName ?? "unknown",
    }),
  });

  const text = await response.text();

  console.log("[PUSH] 백엔드 응답 status:", response.status);
  console.log("[PUSH] 백엔드 응답 body:", text);

  if (!response.ok) {
    throw new Error(`토큰 등록 실패: HTTP ${response.status} / ${text}`);
  }

  return text;
}

async function getExpoPushToken() {
  console.log("[PUSH] 토큰 발급 시작");

  if (!Device.isDevice) {
    throw new Error("실제 기기에서만 푸시 토큰 발급 가능");
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("emergency-alerts", {
      name: "응급 알림",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 300, 200, 300],
      lightColor: "#ff4444",
    });
  }

  const permission = await Notifications.getPermissionsAsync();
  let finalStatus = permission.status;

  if (finalStatus !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    finalStatus = requested.status;
  }

  if (finalStatus !== "granted") {
    throw new Error("알림 권한이 거부되었습니다.");
  }

  const projectId =
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.expoConfig?.extra?.projectId;

  console.log("[PUSH] projectId:", projectId);

  const tokenData = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );

  return tokenData.data;
}

export function usePushToken(userId) {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [pushTokenStatus, setPushTokenStatus] = useState("대기 중");

  useEffect(() => {
    let mounted = true;

    async function run() {
      if (!userId) {
        console.log("[PUSH] userId 없음. 토큰 등록 중단");
        setPushTokenStatus("로그인 사용자 ID 없음");
        return;
      }

      try {
        console.log("[PUSH] 시작. userId:", userId);

        setPushTokenStatus("푸시 토큰 발급 중...");

        const token = await getExpoPushToken();

        console.log("[PUSH] 발급된 토큰:", token);

        if (!mounted) return;

        setExpoPushToken(token);
        setPushTokenStatus("푸시 토큰 발급 완료. 백엔드 등록 중...");

        await registerPushTokenToBackend(token, userId);

        if (!mounted) return;

        setPushTokenStatus("푸시 토큰 백엔드 등록 완료");
      } catch (error) {
        console.log("[PUSH] 에러:", error);

        if (mounted) {
          setPushTokenStatus(`푸시 토큰 실패: ${error.message ?? String(error)}`);
        }
      }
    }

    run();

    return () => {
      mounted = false;
    };
  }, [userId]);

  return {
    expoPushToken,
    pushTokenStatus,
  };
}