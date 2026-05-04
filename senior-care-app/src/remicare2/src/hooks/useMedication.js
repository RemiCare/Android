import { useCallback, useMemo } from "react";
import { useApp } from "../context/AppContext";

// 자바스크립트의 Date().getDay()는 일요일(0)부터 시작합니다.
const DAYS_OF_WEEK = ["일", "월", "화", "수", "목", "금", "토"];

export function useMedication() {
  const { state, setMeds } = useApp();
  const meds = state.meds || [];

  const toggleTaken = useCallback((medId, timeIndex) => {
    setMeds(meds.map(m =>
      m.id === medId
        ? { ...m, taken: m.taken.map((t, i) => i === timeIndex ? !t : t) }
        : m
    ));
  }, [meds, setMeds]);

  const addMed = useCallback((newMed) => {
    setMeds([...meds, newMed]);
  }, [meds, setMeds]);

  const removeMed = useCallback((medId) => {
    setMeds(meds.filter(m => m.id !== medId));
  }, [meds, setMeds]);

  // 오늘의 요일 텍스트 구하기 (예: "월", "화")
  const todayStr = useMemo(() => {
    return DAYS_OF_WEEK[new Date().getDay()];
  }, []);

  // ⭐️ 전체 약 중에서 '오늘 먹어야 하는 약'만 필터링
  const todaysMeds = useMemo(() => {
    return meds.filter(med => 
      !med.days || med.days.length === 0 || med.days.includes(todayStr)
    );
  }, [meds, todayStr]);

  // ⭐️ 전체 약(meds)이 아닌 오늘의 약(todaysMeds)을 기준으로 통계 계산
  const stats = useMemo(() => {
    const total = todaysMeds.reduce((a, m) => a + m.times.length, 0);
    const taken = todaysMeds.reduce((a, m) => a + m.taken.filter(Boolean).length, 0);
    const pct   = total === 0 ? 0 : Math.round((taken / total) * 100);
    const allDone = total > 0 && taken === total;
    return { total, taken, pct, allDone };
  }, [todaysMeds]);

  // ⭐️ 전체 약(meds)이 아닌 오늘의 약(todaysMeds)을 기준으로 다음 약 계산
  const nextMed = useMemo(() => {
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    for (const med of todaysMeds) {
      for (let i = 0; i < med.times.length; i++) {
        if (!med.taken[i] && med.times[i] >= hhmm) {
          return { name: med.name, time: med.times[i] };
        }
      }
    }
    return null;
  }, [todaysMeds]);

  // todaysMeds도 컴포넌트에서 쓸 수 있도록 같이 반환해 줍니다.
  return { meds, todaysMeds, toggleTaken, addMed, removeMed, stats, nextMed };
}