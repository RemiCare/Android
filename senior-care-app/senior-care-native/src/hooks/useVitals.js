import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { BASE_URL } from "../constants";

export function useVitals() {
  const { state } = useApp();
  const [vitals, setVitals] = useState({
    heartRate: null,
    bloodPressure: null,
    calories: null,
    steps: null,
    distance: null,
    respiratoryRate: null,
    sleepHours: null,
    sleepMinutes: null,
    status: "normal",
    lastUpdated: new Date(),
  });
  const [animated, setAnimated] = useState(false);
  const timerRef = useRef(null);

  const flash = () => {
    setAnimated(true);
    setTimeout(() => setAnimated(false), 400);
  };

  const fetchVitals = useCallback(async () => {
    const elderId = state.elder?.id;
    if (!state.isLoggedIn || !state.user?.token || !elderId) return;
    try {
      const res = await fetch(`${BASE_URL}/api/health/${elderId}/today`, {
        headers: { Authorization: `Bearer ${state.user.token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.results?.[0]) {
        const v = data.results[0];
        const heartRate = v.currentHeartRate ?? v.heartRateAvg ?? null;
        const steps = v.stepsTotal ?? null;
        const distance = v.distance ?? null;

        setVitals(prev => ({
          ...prev,

          // 친구 DB에서 실제로 들어오는 항목
          heartRate,
          steps,
          distance,

          // 현재 데이터가 확인되지 않은 항목
          calories: null,
         respiratoryRate: null,
          sleepHours: null,
          sleepMinutes: null,

          status:
            heartRate == null
              ? "normal"
              : heartRate >= 130 || heartRate < 40
                ? "warning"
                : heartRate >= 100 || heartRate < 60
                  ? "caution"
                  : "normal",

          lastUpdated: new Date(),
        }));

console.log("[VITALS FROM BACKEND]", {
  heartRate,
  steps,
  distance,
});
        flash();
      }
    } catch {
      // 네트워크 오류 시 기존 값 유지
    }
  }, [state.isLoggedIn, state.user?.token, state.elder?.id]);

  useEffect(() => {
    if (state.isLoggedIn && state.user?.token) {
      // 백엔드 연동: 10초마다 갱신
      fetchVitals();
      timerRef.current = setInterval(fetchVitals, 10000);
    } else {
      setVitals({
        heartRate: null,
        bloodPressure: null,
        calories: null,
        steps: null,
        distance: null,
        respiratoryRate: null,
        sleepHours: null,
        sleepMinutes: null,
        status: "normal",
        lastUpdated: new Date(),
      });
    }
    return () => clearInterval(timerRef.current);
  }, [fetchVitals, state.isLoggedIn, state.user?.token]);

  const statusColor = { normal: "#34D399", caution: "#FBBF24", warning: "#F87171" }[vitals.status];

  return { vitals, animated, statusColor, refresh: fetchVitals };
}
