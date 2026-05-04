import { useCallback, useMemo } from "react";
import { useApp } from "../context/AppContext";

const DAYS_OF_WEEK = ["일", "월", "화", "수", "목", "금", "토"];

export function useTimeline() {
  const { state, setTimeline } = useApp();
  const timeline = state.timeline || [];

  const addTimelineItem = useCallback((newItem) => {
    setTimeline([...timeline, newItem]);
  }, [timeline, setTimeline]);

  const removeTimelineItem = useCallback((id) => {
    setTimeline(timeline.filter(item => item.id !== id));
  }, [timeline, setTimeline]);

  const updateTimelineItem = useCallback((id, updates) => {
    setTimeline(timeline.map(item => item.id === id ? { ...item, ...updates } : item));
  }, [timeline, setTimeline]);

  // 오늘의 요일 구하기
  const todayStr = useMemo(() => DAYS_OF_WEEK[new Date().getDay()], []);

  // ⭐️ 사진 속 메모처럼 "오늘의 일정(요일)"만 필터링
  const todaysTimeline = useMemo(() => {
    return timeline
      .filter(item => !item.days || item.days.length === 0 || item.days.includes(todayStr))
      .sort((a, b) => a.time.localeCompare(b.time)); // 시간순 정렬
  }, [timeline, todayStr]);

  return { 
    timeline, 
    todaysTimeline, // 메인 화면에서 사용할 필터링된 데이터
    addTimelineItem, 
    removeTimelineItem, 
    updateTimelineItem 
  };
}