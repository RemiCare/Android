import { useState, useEffect, useRef } from "react";

export function useVitals() {
  const [vitals, setVitals] = useState({
    heartRate:     72,
    bloodPressure: "118/76",
    oxygen:        98.4,
    status:        "normal",
    lastUpdated:   new Date(),
  });
  const [animated, setAnimated] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // 실제 서비스: 웨어러블 WebSocket 연결
    timerRef.current = setInterval(() => {
      setVitals(prev => {
        const hr  = Math.round(prev.heartRate + (Math.random() - 0.5) * 4);
        const oxy = Math.round((prev.oxygen + (Math.random() - 0.5) * 0.4) * 10) / 10;
        const clampedHr  = Math.max(58, Math.min(105, hr));
        const clampedOxy = Math.max(94, Math.min(99.9, oxy));
        const status =
          clampedHr > 100 || clampedOxy < 95 ? "warning" :
          clampedHr > 95  || clampedOxy < 96 ? "caution" : "normal";
        return {
          heartRate:     clampedHr,
          bloodPressure: prev.bloodPressure,
          oxygen:        clampedOxy,
          status,
          lastUpdated:   new Date(),
        };
      });
      setAnimated(true);
      setTimeout(() => setAnimated(false), 400);
    }, 3500);

    return () => clearInterval(timerRef.current);
  }, []);

  const statusColor = {
    normal:  "#34D399",
    caution: "#FBBF24",
    warning: "#F87171",
  }[vitals.status];

  return { vitals, animated, statusColor };
}
