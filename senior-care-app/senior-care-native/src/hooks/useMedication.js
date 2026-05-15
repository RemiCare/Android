import { useCallback, useMemo, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { BASE_URL } from "../constants";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const COLORS = ["#2DD4BF", "#60A5FA", "#FBBF24", "#C084FC", "#F06292", "#34D399", "#FB923C"];

function extractHHMM(iso) {
  if (!iso) return "00:00";
  const t = iso.includes("T") ? iso.split("T")[1] : iso;
  return t.slice(0, 5);
}

function repeatCycleToDays(cycle) {
  if (cycle === "ONCE") return [DAY_KEYS[new Date().getDay()]];
  return [...DAY_KEYS];
}

function daysToRepeatCycle(days) {
  return (days || []).length === 7 ? "DAILY" : "WEEKLY";
}

function groupToMed(group, i) {
  const sorted = [...group.alarms].sort((a, b) =>
    extractHHMM(a.time).localeCompare(extractHHMM(b.time))
  );
  return {
    id: group.groupId,
    name: group.medicineName,
    note: group.medicineNote,
    repeatCycle: group.repeatCycle,
    color: COLORS[i % COLORS.length],
    times: sorted.map(a => extractHHMM(a.time)),
    taken: sorted.map(a => a.completed),
    alarmIds: sorted.map(a => a.alarmId),
    days: repeatCycleToDays(group.repeatCycle),
  };
}

export function useMedication() {
  const { state, setMeds } = useApp();
  const allMeds = state.meds || [];
  const elderId = state.elder?.id;
  const token = state.user?.token;
  const isLoggedIn = state.isLoggedIn;

  const fetchRef = useRef(null);

  const fetchMeds = useCallback(async () => {
    if (!isLoggedIn || !token || !elderId) return;
    try {
      const res = await fetch(`${BASE_URL}/api/social-worker/alarm/${elderId}/alarms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setMeds((data.results || []).map(groupToMed));
    } catch {}
  }, [isLoggedIn, token, elderId, setMeds]);

  fetchRef.current = fetchMeds;

  useEffect(() => { fetchMeds(); }, [fetchMeds]);

  const todayKey = DAY_KEYS[new Date().getDay()];
  const todayMeds = useMemo(
    () => allMeds.filter(m => !m.days || m.days.includes(todayKey)),
    [allMeds, todayKey]
  );

  const toggleTaken = useCallback((medId, timeIndex) => {
    const med = allMeds.find(m => m.id === medId);
    if (!med) return;
    const wasTaken = med.taken[timeIndex];

    setMeds(allMeds.map(m =>
      m.id === medId
        ? { ...m, taken: m.taken.map((t, i) => i === timeIndex ? !t : t) }
        : m
    ));

    // Only call API when marking as complete (backend is one-way)
    const alarmId = med.alarmIds?.[timeIndex];
    if (!wasTaken && isLoggedIn && token && alarmId) {
      fetch(
        `${BASE_URL}/api/social-worker/alarm/alarm/${alarmId}/complete?elderlyId=${elderId}`,
        { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => {});
    }
  }, [allMeds, setMeds, isLoggedIn, token, elderId]);

  const addMed = useCallback(async (newMed) => {
    if (isLoggedIn && token && elderId) {
      try {
        const sortedTimes = [...newMed.times].sort();
        await fetch(`${BASE_URL}/api/social-worker/alarm/${elderId}/group`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            medicineName: newMed.name,
            repeatCycle: daysToRepeatCycle(newMed.days),
            medicineNote: "",
            times: sortedTimes,
            dosage: sortedTimes.map(() => 1.0),
          }),
        });
        await fetchRef.current?.();
      } catch {
        setMeds([...allMeds, { ...newMed, id: Date.now(), alarmIds: [] }]);
      }
    } else {
      setMeds([...allMeds, { ...newMed, id: Date.now(), alarmIds: [] }]);
    }
  }, [allMeds, setMeds, isLoggedIn, token, elderId]);

  const removeMed = useCallback(async (medId) => {
    setMeds(allMeds.filter(m => m.id !== medId));
    if (isLoggedIn && token && elderId) {
      fetch(
        `${BASE_URL}/api/social-worker/alarm/group/${medId}?elderlyId=${elderId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => {});
    }
  }, [allMeds, setMeds, isLoggedIn, token, elderId]);

  const stats = useMemo(() => {
    const total = todayMeds.reduce((a, m) => a + m.times.length, 0);
    const taken = todayMeds.reduce((a, m) => a + m.taken.filter(Boolean).length, 0);
    const pct   = total === 0 ? 0 : Math.round((taken / total) * 100);
    return { total, taken, pct, allDone: total > 0 && taken === total };
  }, [todayMeds]);

  const nextMed = useMemo(() => {
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    for (const med of todayMeds) {
      for (let i = 0; i < med.times.length; i++) {
        if (!med.taken[i] && med.times[i] >= hhmm) return { name: med.name, time: med.times[i] };
      }
    }
    return null;
  }, [todayMeds]);

  return { meds: allMeds, todayMeds, toggleTaken, addMed, removeMed, stats, nextMed };
}
