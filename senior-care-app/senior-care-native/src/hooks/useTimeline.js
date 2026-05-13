import { useEffect, useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { useApp } from "../context/AppContext";
import { BASE_URL } from "../constants";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const DAY_TO_JAVA = {
  sun: "SUNDAY", mon: "MONDAY", tue: "TUESDAY", wed: "WEDNESDAY",
  thu: "THURSDAY", fri: "FRIDAY", sat: "SATURDAY",
};
const JAVA_TO_DAY = {
  SUNDAY: "sun", MONDAY: "mon", TUESDAY: "tue", WEDNESDAY: "wed",
  THURSDAY: "thu", FRIDAY: "fri", SATURDAY: "sat",
};

function serverToLocal(s) {
  const rawTime = s.executionTime || s.time || "00:00:00";
  const time = rawTime.length >= 5 ? rawTime.slice(0, 5) : rawTime;
  const days = (s.daysOfWeek || DAY_KEYS).map(d => JAVA_TO_DAY[d] || d);
  return {
    id:     String(s.id),
    time,
    label:  s.title || s.label || "",
    status: "wait",
    note:   "예정",
    days,
  };
}

export function useTimeline() {
  const { state, setTimeline } = useApp();
  const timeline = state.timeline || [];
  const token = state.user?.token;
  const isLoggedIn = state.isLoggedIn;
  const elderlyId = state.elder?.id;

  const fetchTimeline = useCallback(async () => {
    if (!isLoggedIn || !token || !elderlyId) return;
    try {
      const res = await fetch(`${BASE_URL}/api/schedule/elderly/${elderlyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const items = (data.results || []).map(serverToLocal);
      setTimeline(items);
    } catch {
      // 네트워크 오류 시 로컬 유지
    }
  }, [isLoggedIn, token, elderlyId, setTimeline]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  const todayKey = DAY_KEYS[new Date().getDay()];
  const todayTimeline = useMemo(
    () => timeline.filter(item => !item.days || item.days.includes(todayKey)),
    [timeline, todayKey]
  );

  const addTimelineItem = useCallback(async (newItem) => {
    if (isLoggedIn && token && elderlyId) {
      try {
        const body = {
          title:         newItem.label,
          content:       newItem.note || "",
          executionTime: `${newItem.time}:00`,
          daysOfWeek:    (newItem.days || DAY_KEYS).map(d => DAY_TO_JAVA[d] || d),
          elderlyId:     Number(elderlyId),
        };
        const res = await fetch(`${BASE_URL}/api/schedule`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        if (res.ok) { fetchTimeline(); return; }
        const err = await res.json().catch(() => ({}));
        Alert.alert("일정 추가 실패", err?.status?.message || `오류 코드: ${res.status}`);
      } catch (e) {
        Alert.alert("일정 추가 실패", e.message || "네트워크 오류");
      }
    } else {
      setTimeline([...timeline, { ...newItem, id: `t_${Date.now()}` }]);
    }
  }, [isLoggedIn, token, elderlyId, timeline, setTimeline, fetchTimeline]);

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

  const updateTimelineItem = useCallback(async (id, updates) => {
    if (isLoggedIn && token && elderlyId) {
      try {
        const current = timeline.find(item => item.id === id);
        const merged = { ...current, ...updates };
        const res = await fetch(`${BASE_URL}/api/schedule/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            title:         merged.label,
            content:       merged.note || "",
            executionTime: `${merged.time}:00`,
            daysOfWeek:    (merged.days || DAY_KEYS).map(d => DAY_TO_JAVA[d] || d),
            elderlyId:     Number(elderlyId),
          }),
        });
        if (res.ok) { fetchTimeline(); return; }
      } catch {}
    }
    setTimeline(timeline.map(item => item.id === id ? { ...item, ...updates } : item));
  }, [isLoggedIn, token, elderlyId, timeline, setTimeline, fetchTimeline]);

  // 백엔드에 toggle 엔드포인트 없음 — 로컬 상태만 변경
  const toggleComplete = useCallback((id) => {
    setTimeline(timeline.map(item =>
      item.id === id
        ? { ...item, status: item.status === "done" ? "wait" : "done", note: item.status === "done" ? "예정" : "완료" }
        : item
    ));
  }, [timeline, setTimeline]);

  return { timeline, todayTimeline, addTimelineItem, removeTimelineItem, updateTimelineItem, toggleComplete };
}
