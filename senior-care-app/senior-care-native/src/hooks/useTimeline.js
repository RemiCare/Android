import { useEffect, useCallback, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { BASE_URL } from "../constants";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function serverToLocal(s) {
  return {
    id:     String(s.id || s.scheduleId),
    time:   s.time || "00:00",
    label:  s.title || s.label || "",
    status: s.completed ? "done" : "wait",
    note:   s.completed ? "완료" : "예정",
    days:   s.days || DAY_KEYS,
  };
}

export function useTimeline() {
  const { state, setTimeline } = useApp();
  const timeline = state.timeline || [];
  const token = state.user?.token;
  const isLoggedIn = state.isLoggedIn;

  const fetchTimeline = useCallback(async () => {
    if (!isLoggedIn || !token) return;
    try {
      const res = await fetch(`${BASE_URL}/api/schedule`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const items = (data.results || []).map(serverToLocal);
      setTimeline(items);
    } catch {
      // 네트워크 오류 시 로컬 유지
    }
  }, [isLoggedIn, token, setTimeline]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  const todayKey = DAY_KEYS[new Date().getDay()];
  const todayTimeline = useMemo(
    () => timeline.filter(item => !item.days || item.days.includes(todayKey)),
    [timeline, todayKey]
  );

  const addTimelineItem = useCallback(async (newItem) => {
    if (isLoggedIn && token) {
      try {
        const res = await fetch(`${BASE_URL}/api/schedule`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: newItem.label, time: newItem.time }),
        });
        if (res.ok) { fetchTimeline(); return; }
      } catch {}
    }
    setTimeline([...timeline, newItem]);
  }, [isLoggedIn, token, timeline, setTimeline, fetchTimeline]);

  const removeTimelineItem = useCallback(async (id) => {
    if (isLoggedIn && token) {
      try {
        const res = await fetch(`${BASE_URL}/api/schedule/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) { fetchTimeline(); return; }
      } catch {}
    }
    setTimeline(timeline.filter(item => item.id !== id));
  }, [isLoggedIn, token, timeline, setTimeline, fetchTimeline]);

  const updateTimelineItem = useCallback((id, updates) => {
    setTimeline(timeline.map(item => item.id === id ? { ...item, ...updates } : item));
  }, [timeline, setTimeline]);

  const toggleComplete = useCallback(async (id) => {
    setTimeline(timeline.map(item =>
      item.id === id
        ? { ...item, status: item.status === "done" ? "wait" : "done", note: item.status === "done" ? "예정" : "완료" }
        : item
    ));
    if (isLoggedIn && token) {
      try {
        await fetch(`${BASE_URL}/api/schedule/${id}/toggle`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
  }, [isLoggedIn, token, timeline, setTimeline]);

  return { timeline, todayTimeline, addTimelineItem, removeTimelineItem, updateTimelineItem, toggleComplete };
}
