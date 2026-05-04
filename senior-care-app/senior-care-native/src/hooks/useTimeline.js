import { useCallback, useMemo } from "react";
import { useApp } from "../context/AppContext";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function useTimeline() {
  const { state, setTimeline } = useApp();
  const timeline = state.timeline || [];

  const todayKey = DAY_KEYS[new Date().getDay()];
  const todayTimeline = useMemo(
    () => timeline.filter(item => !item.days || item.days.includes(todayKey)),
    [timeline, todayKey]
  );

  const addTimelineItem = useCallback((newItem) => {
    setTimeline([...timeline, newItem]);
  }, [timeline, setTimeline]);

  const removeTimelineItem = useCallback((id) => {
    setTimeline(timeline.filter(item => item.id !== id));
  }, [timeline, setTimeline]);

  const updateTimelineItem = useCallback((id, updates) => {
    setTimeline(timeline.map(item => item.id === id ? { ...item, ...updates } : item));
  }, [timeline, setTimeline]);

  return { timeline, todayTimeline, addTimelineItem, removeTimelineItem, updateTimelineItem };
}
