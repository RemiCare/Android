import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { BASE_URL } from "../constants";

export function useVitals() {
  const { state } = useApp();
  const [vitals, setVitals] = useState({
    heartRate:     72,
    bloodPressure: "118/76",
    oxygen:        98.4,
    steps:         0,
    status:        "normal",
    lastUpdated:   new Date(),
  });
  const [animated, setAnimated] = useState(false);
  const timerRef = useRef(null);

  const flash = () => {
    setAnimated(true);
    setTimeout(() => setAnimated(false), 400);
  };

  const fetchVitals = useCallback(async () => {
    if (!state.isLoggedIn || !state.user?.token) return;
    try {
      const res = await fetch(`${BASE_URL}/api/vital/latest`, {
        headers: { Authorization: `Bearer ${state.user.token}` },
      });
      if (res.status === 401 || res.status === 403) return;
      const data = await res.json();
      if (res.ok && data.results?.[0]) {
        const v = data.results[0];
        const hr  = v.heartRate   || 72;
        const oxy = v.bloodOxygen || 98.4;
        setVitals({
          heartRate:     hr,
          bloodPressure: v.bloodPressure || "118/76",
          oxygen:        oxy,
          steps:         v.steps || 0,
          status: (hr > 100 || oxy < 95) ? "warning" : (hr > 95 || oxy < 96) ? "caution" : "normal",
          lastUpdated:   new Date(v.timestamp || Date.now()),
        });
        flash();
      }
    } catch {
      // 네트워크 오류 시 기존 값 유지
    }
  }, [state.isLoggedIn, state.user?.token]);

  useEffect(() => {
    if (state.isLoggedIn && state.user?.token) {
      // 백엔드 연동: 10초마다 갱신
      fetchVitals();
      timerRef.current = setInterval(fetchVitals, 10000);
    } else {
      // 데모 모드: 랜덤 시뮬레이션
      timerRef.current = setInterval(() => {
        setVitals(prev => {
          const hr  = Math.max(58, Math.min(105, Math.round(prev.heartRate + (Math.random() - 0.5) * 4)));
          const oxy = Math.max(94, Math.min(99.9, Math.round((prev.oxygen + (Math.random() - 0.5) * 0.4) * 10) / 10));
          const status = hr > 100 || oxy < 95 ? "warning" : hr > 95 || oxy < 96 ? "caution" : "normal";
          return { ...prev, heartRate: hr, oxygen: oxy, status, lastUpdated: new Date() };
        });
        flash();
      }, 3500);
    }
    return () => clearInterval(timerRef.current);
  }, [fetchVitals, state.isLoggedIn, state.user?.token]);

  const statusColor = { normal: "#34D399", caution: "#FBBF24", warning: "#F87171" }[vitals.status];

  return { vitals, animated, statusColor, refresh: fetchVitals };
}
