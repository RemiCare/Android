import { useState, useCallback, useMemo } from "react";
import { useApp } from "../context/AppContext";

const DEFAULT_MEDS = [
  { id: 1, name: "혈압약 (암로디핀 5mg)", times: ["09:00"],         taken: [true],         color: "#2DD4BF" },
  { id: 2, name: "혈당약 (메트포르민)",   times: ["08:00", "20:00"], taken: [true, false],  color: "#60A5FA" },
  { id: 3, name: "비타민D",              times: ["12:00"],          taken: [false],        color: "#FBBF24" },
  { id: 4, name: "오메가3",              times: ["21:00"],          taken: [false],        color: "#C084FC" },
];

export function useMedication() {
  const { state } = useApp();
  const elderId = state.selectedElderId;

  const [allMeds, setAllMeds] = useState(() => ({ [elderId]: DEFAULT_MEDS }));

  const meds = allMeds[elderId] || [];

  const addMed = useCallback((med) => {
    setAllMeds(prev => ({
      ...prev,
      [elderId]: [...(prev[elderId] || []), med],
    }));
  }, [elderId]);

  const removeMed = useCallback((id) => {
    setAllMeds(prev => ({
      ...prev,
      [elderId]: (prev[elderId] || []).filter(m => m.id !== id),
    }));
  }, [elderId]);

  const toggleTaken = useCallback((medId, timeIndex) => {
    setAllMeds(prev => ({
      ...prev,
      [elderId]: (prev[elderId] || []).map(m =>
        m.id === medId
          ? { ...m, taken: m.taken.map((t, i) => i === timeIndex ? !t : t) }
          : m
      ),
    }));
  }, [elderId]);

  const stats = useMemo(() => {
    const total = meds.reduce((a, m) => a + m.times.length, 0);
    const taken = meds.reduce((a, m) => a + m.taken.filter(Boolean).length, 0);
    const pct   = Math.round(total > 0 ? (taken / total) * 100 : 0);
    const allDone = total > 0 && taken === total;
    return { total, taken, pct, allDone };
  }, [meds]);

  const nextMed = useMemo(() => {
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    for (const med of meds) {
      for (let i = 0; i < med.times.length; i++) {
        if (!med.taken[i] && med.times[i] >= hhmm) {
          return { name: med.name, time: med.times[i] };
        }
      }
    }
    return null;
  }, [meds]);

  return { meds, addMed, removeMed, toggleTaken, stats, nextMed };
}
