import { useCallback, useMemo } from "react";
import { useApp } from "../context/AppContext";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function useMedication() {
  const { state, setMeds } = useApp();
  const allMeds = state.meds || [];

  const todayKey = DAY_KEYS[new Date().getDay()];
  const todayMeds = useMemo(
    () => allMeds.filter(m => !m.days || m.days.includes(todayKey)),
    [allMeds, todayKey]
  );

  const toggleTaken = useCallback((medId, timeIndex) => {
    setMeds(allMeds.map(m =>
      m.id === medId
        ? { ...m, taken: m.taken.map((t, i) => i === timeIndex ? !t : t) }
        : m
    ));
  }, [allMeds, setMeds]);

  const addMed = useCallback((newMed) => {
    setMeds([...allMeds, newMed]);
  }, [allMeds, setMeds]);

  const removeMed = useCallback((medId) => {
    setMeds(allMeds.filter(m => m.id !== medId));
  }, [allMeds, setMeds]);

  const stats = useMemo(() => {
    const total = todayMeds.reduce((a, m) => a + m.times.length, 0);
    const taken = todayMeds.reduce((a, m) => a + m.taken.filter(Boolean).length, 0);
    const pct   = total === 0 ? 0 : Math.round((taken / total) * 100);
    const allDone = total > 0 && taken === total;
    return { total, taken, pct, allDone };
  }, [todayMeds]);

  const nextMed = useMemo(() => {
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    for (const med of todayMeds) {
      for (let i = 0; i < med.times.length; i++) {
        if (!med.taken[i] && med.times[i] >= hhmm) {
          return { name: med.name, time: med.times[i] };
        }
      }
    }
    return null;
  }, [todayMeds]);

  return { meds: allMeds, todayMeds, toggleTaken, addMed, removeMed, stats, nextMed };
}
