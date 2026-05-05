import { useState, useEffect, useRef, useCallback } from "react";
import { BASE_URL } from "../constants";
import { useApp } from "../context/AppContext";

export function useVitals() {
  const { state } = useApp();
  const [vitals, setVitals] = useState({
    heartRate:     72,
    steps:         0,
    oxygen:        98.4,
    status:        "normal",
    lastUpdated:   new Date(),
  });
  const [animated, setAnimated] = useState(false);
  const timerRef = useRef(null);

  const fetchLatestVitals = useCallback(async () => {
    // 로그인 상태가 아니거나 토큰이 없으면 절대 요청하지 않음
    if (!state.isLoggedIn || !state.user?.token) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/vital/latest`, {
        headers: {
          "Authorization": `Bearer ${state.user.token}`
        }
      });
      
      // 401이나 403 에러가 나면 토큰 문제이므로 중단
      if (response.status === 401 || response.status === 403) return;

      const data = await response.json();
      
      if (response.ok && data.results && data.results[0]) {
        const latest = data.results[0];
        setVitals({
          heartRate: latest.heartRate || 72,
          steps: latest.steps || 0,
          oxygen: latest.bloodOxygen || 98.4,
          status: (latest.heartRate > 100 || latest.bloodOxygen < 95) ? "warning" : "normal",
          lastUpdated: new Date(latest.timestamp || Date.now()),
        });
        setAnimated(true);
        setTimeout(() => setAnimated(false), 400);
      }
    } catch (e) {
      console.error("바이탈 조회 실패:", e);
    }
  }, [state.isLoggedIn, state.user?.token]);

  useEffect(() => {
    fetchLatestVitals();
    // 10초마다 갱신
    timerRef.current = setInterval(fetchLatestVitals, 10000);
    return () => clearInterval(timerRef.current);
  }, [fetchLatestVitals]);

  const statusColor = {
    normal:  "#34D399",
    caution: "#FBBF24",
    warning: "#F87171",
  }[vitals.status];

  return { vitals, animated, statusColor, refresh: fetchLatestVitals };
}
