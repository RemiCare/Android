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
    oxygenSaturation: null,
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
    if (!state.isLoggedIn || !elderId) return false;
    try {
      const headers = {};
      if (state.user?.token) {
        headers["Authorization"] = `Bearer ${state.user.token}`;
      }
      const res = await fetch(`${BASE_URL}/api/health/${elderId}/today`, { headers });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.results?.[0]) {
        const v = data.results[0];
        const heartRate = v.currentHeartRate ?? v.heartRateAvg ?? null;
        const steps = v.stepsTotal ?? null;
        const distance = v.distance ?? null;

        if (heartRate !== null || steps !== null) {
          setVitals(prev => ({
            ...prev,
            heartRate,
            steps,
            distance,
            calories: v.activeCalories ?? null,
            respiratoryRate: v.respiratoryRate ?? null,
            sleepHours: v.sleepHours ?? null,
            sleepMinutes: v.sleepMinutes ?? null,
            oxygenSaturation: v.oxygenSaturation ?? null,
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
          console.log("[VITALS FROM BACKEND]", { heartRate, steps, distance });
          flash();
          return true;
        }
      }
    } catch (e) {
      console.log("[fetchVitals Error]", e);
    }
    return false;
  }, [state.isLoggedIn, state.user?.token, state.elder?.id]);

  useEffect(() => {
    if (state.isLoggedIn) {
      const updateVitalsPipeline = async () => {
        const fetched = await fetchVitals();
        if (!fetched && state.user?.email === "demo@remicare.com") {
          setVitals(prev => ({
            ...prev,
            heartRate: 65 + Math.floor(Math.random() * 20),
            bloodPressure: "118/76",
            calories: 180 + Math.floor(Math.random() * 50),
            steps: 4200 + Math.floor(Math.random() * 1000),
            distance: 3.1 + Math.random() * 0.5,
            respiratoryRate: 14 + Math.floor(Math.random() * 4),
            sleepHours: 7.2,
            sleepMinutes: 432,
            oxygenSaturation: 97 + Math.floor(Math.random() * 3),
            status: "normal",
            lastUpdated: new Date(),
          }));
        }
      };
      updateVitalsPipeline();
      timerRef.current = setInterval(updateVitalsPipeline, 10000);
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
        oxygenSaturation: null,
        status: "normal",
        lastUpdated: new Date(),
      });
    }
    return () => clearInterval(timerRef.current);
  }, [fetchVitals, state.isLoggedIn, state.user?.email]);

  const statusColor = { normal: "#34D399", caution: "#FBBF24", warning: "#F87171" }[vitals.status];

  return { vitals, animated, statusColor, refresh: fetchVitals };
}
