import { useState, useCallback, useEffect } from "react";
import { useApp } from "../context/AppContext";

export const EMERGENCY_HISTORY = [
  { id:1, date:"04/10  09:12", type:"낙상 의심",      severity:"high", source:"홈캠",     confidence:94, detail:"거실에서 급격한 자세 변화 감지. 심박수 118bpm 동시 상승. 약 40초 후 정상 복귀 확인." },
  { id:2, date:"04/08  14:33", type:"심박수 이상",    severity:"mid",  source:"웨어러블", confidence:89, detail:"심박수 112bpm 지속 2분. 혈압 145/92. 활동량 정상 범위 내이나 주의 필요." },
  { id:3, date:"04/06  03:21", type:"배회 감지",      severity:"mid",  source:"웨어러블", confidence:91, detail:"수면 중 반복적 이동 패턴 감지. 07:00 이전 활동량 급증. 수면 질 저하 가능성." },
  { id:4, date:"04/03  18:45", type:"호흡 이상",      severity:"low",  source:"웨어러블", confidence:76, detail:"호흡수 분당 22회 (정상 12~20회). 지속 시간 약 5분. 이후 정상 복귀." },
  { id:5, date:"04/01  11:10", type:"거동 불능 의심", severity:"high", source:"홈캠",     confidence:97, detail:"30분 이상 움직임 없음 감지. 비상 통화 후 수면 중으로 확인." },
];

export const SEV = {
  high: { bg:"#270A0A", color:"#F87171", border:"rgba(248,113,113,0.25)", label:"고위험" },
  mid:  { bg:"#271E00", color:"#FBBF24", border:"rgba(251,191,36,0.25)",  label:"주의" },
  low:  { bg:"#0F2040", color:"#60A5FA", border:"rgba(96,165,250,0.25)",  label:"낮음" },
};

export function useEmergency() {
  const { setEmergency } = useApp();
  const [callOpen,    setCallOpen]    = useState(false);
  const [callStatus,  setCallStatus]  = useState("idle"); // idle | connecting | connected
  const [filter,      setFilter]      = useState("all");
  const [selectedId,  setSelectedId]  = useState(null);
  const [dismissed,   setDismissed]   = useState([]);

  const filtered = EMERGENCY_HISTORY.filter(e =>
    !dismissed.includes(e.id) && (filter === "all" || e.severity === filter)
  );

  const openCall = useCallback(() => {
    setCallOpen(true);
    setCallStatus("connecting");
    setEmergency(true);
    setTimeout(() => setCallStatus("connected"), 2000);
  }, [setEmergency]);

  const closeCall = useCallback(() => {
    setCallOpen(false);
    setCallStatus("idle");
    setEmergency(false);
  }, [setEmergency]);

  const dismissEvent = useCallback((id) => {
    setDismissed(prev => [...prev, id]);
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const toggleSelected = useCallback((id) => {
    setSelectedId(prev => prev === id ? null : id);
  }, []);

  const highCount = EMERGENCY_HISTORY.filter(e => e.severity === "high").length;

  return {
    callOpen, callStatus, openCall, closeCall,
    filter, setFilter,
    selectedId, toggleSelected,
    filtered, dismissEvent,
    highCount,
  };
}