import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { BASE_URL } from "../constants";

export function useVitals() {
  const { state } = useApp();
  const [vitals, setVitals] = useState({
    heartRate:     72,
    bloodPressure: "118/76",
    calories:      0.0,
    steps:         0,
    distance:      0.0,
    respiratoryRate: 16,
    sleepHours:    0,
    sleepMinutes:  0,
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
        const hr = v.currentHeartRate || v.heartRateAvg || 72;
        // 활동 칼로리 소모량 수집 매핑 (DB 필드가 null 이면 steps 기반 계산값으로 폴백)
        const cals = v.activeCalories || Math.round((v.stepsTotal || 0) * 0.04);
        setVitals(prev => ({
          ...prev,
          heartRate:   hr,
          steps:       v.stepsTotal   || 0,
          calories:    cals,
          distance:    v.distance     || 0.0,
          respiratoryRate: v.respiratoryRate || 16,
          sleepHours:  v.sleepHours   || 0,
          sleepMinutes: v.sleepMinutes || 0,
          status: hr > 100 ? "warning" : hr > 95 ? "caution" : "normal",
          lastUpdated: new Date(),
        }));
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
      // 데모 모드: 랜덤 시뮬레이션
      timerRef.current = setInterval(() => {
        setVitals(prev => {
          const hr  = Math.max(58, Math.min(105, Math.round(prev.heartRate + (Math.random() - 0.5) * 4)));
          const cals = prev.calories + Math.round(Math.random() * 5); // 데모 활동 칼로리 점진 소폭 증가
          const dist = prev.distance + (Math.random() * 0.02); // 데모 보행 거리 점진 소폭 증가 (km)
          const resp = Math.max(14, Math.min(22, Math.round(prev.respiratoryRate + (Math.random() - 0.5) * 2))); // 데모 호흡수 안정 범위 변동
          const status = hr > 100 ? "warning" : hr > 95 ? "caution" : "normal";
          return { ...prev, heartRate: hr, calories: cals, distance: parseFloat(dist.toFixed(3)), respiratoryRate: resp, status, lastUpdated: new Date() };
        });
        flash();
      }, 3500);
    }
    return () => clearInterval(timerRef.current);
  }, [fetchVitals, state.isLoggedIn, state.user?.token]);

  const statusColor = { normal: "#34D399", caution: "#FBBF24", warning: "#F87171" }[vitals.status];

  return { vitals, animated, statusColor, refresh: fetchVitals };
}
