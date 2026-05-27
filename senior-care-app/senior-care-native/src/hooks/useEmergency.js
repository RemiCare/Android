import { useState, useCallback, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";

export const EMERGENCY_HISTORY = [
  { id:1, date:"04/10  09:12", type:"낙상 의심",      severity:"high", source:"홈캠",     confidence:94, detail:"거실에서 급격한 자세 변화 감지. 심박수 118bpm 동시 상승. 약 40초 후 정상 복귀 확인." },
  { id:2, date:"04/08  14:33", type:"심박수 이상",    severity:"mid",  source:"웨어러블", confidence:89, detail:"심박수 112bpm 지속 2분. 혈압 145/92. 활동량 정상 범위 내이나 주의 필요." },
  { id:3, date:"04/06  03:21", type:"배회 감지",      severity:"mid",  source:"웨어러블", confidence:91, detail:"수면 중 반복적 이동 패턴 감지. 07:00 이전 활동량 급증. 수면 질 저하 가능성." },
  { id:4, date:"04/03  18:45", type:"호흡 이상",      severity:"low",  source:"웨어러블", confidence:76, detail:"호흡수 분당 22회 (정상 12~20회). 지속 시간 약 5분. 이후 정상 복귀." },
  { id:5, date:"04/01  11:10", type:"거동 불능 의심", severity:"high", source:"홈캠",     confidence:97, detail:"30분 이상 움직임 없음 감지. 비상 통화 후 수면 중으로 확인." },
];

export const SEV = {
  high: { bg:"#FDEEF0", color:"#E05555", border:"rgba(224,85,85,0.3)",   label:"고위험" },
  mid:  { bg:"#FFF3F0", color:"#FF7A59", border:"rgba(255,122,89,0.3)",  label:"주의" },
  low:  { bg:"#EEF2FF", color:"#5C7CFA", border:"rgba(92,124,250,0.3)",  label:"낮음" },
};

export function useEmergency() {
  const { state, setEmergency } = useApp();
  const [callOpen,   setCallOpen]   = useState(false);
  const [callStatus, setCallStatus] = useState("idle");
  const [alertOpen,  setAlertOpen]  = useState(false);
  const [alertType,  setAlertType]  = useState(""); // "fall" | "bathroom"
  const [alertMessage, setAlertMessage] = useState("");
  const [filter,     setFilter]     = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [dismissed,  setDismissed]  = useState([]);

  const openCall = useCallback(() => {
    setAlertOpen(false); // 통화 시 경고 팝업은 닫음
    setCallOpen(true);
    setCallStatus("connecting");
    setEmergency(true);
    setTimeout(() => setCallStatus("connected"), 2000);
  }, [setEmergency]);

  const callOpenRef = useRef(false);
  callOpenRef.current = callOpen;
  const alertOpenRef = useRef(false);
  alertOpenRef.current = alertOpen;

  // AI 서버 낙상/화장실 감지 폴링 (3초마다)
  useEffect(() => {
    if (!state.aiServerUrl) return;
    const interval = setInterval(async () => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${state.aiServerUrl}/api/status`, { signal: controller.signal });
        clearTimeout(timer);
        if (res.ok) {
          const data = await res.json();
          if ((data.fall_detected || data.bathroom_alert) && !callOpenRef.current && !alertOpenRef.current) {
            setAlertType(data.fall_detected ? "fall" : "bathroom");
            setAlertMessage(data.explanation || "");
            setAlertOpen(true);
            fetch(`${state.aiServerUrl}/api/status/reset`, { method: "POST" }).catch(() => {});
          }
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [state.aiServerUrl]);

  const closeCall = useCallback(() => {
    setCallOpen(false);
    setCallStatus("idle");
    setEmergency(false);
  }, [setEmergency]);

  const closeAlert = useCallback(() => {
    setAlertOpen(false);
    setAlertType("");
    setAlertMessage("");
  }, []);

  const dismissEvent = useCallback((id) => {
    setDismissed(prev => [...prev, id]);
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const toggleSelected = useCallback((id) => {
    setSelectedId(prev => prev === id ? null : id);
  }, []);

  const filtered = EMERGENCY_HISTORY.filter(e =>
    !dismissed.includes(e.id) && (filter === "all" || e.severity === filter)
  );
  const highCount = EMERGENCY_HISTORY.filter(e => e.severity === "high").length;

  return {
    callOpen, callStatus, openCall, closeCall,
    alertOpen, alertType, closeAlert, alertMessage,
    filter, setFilter,
    selectedId, toggleSelected,
    filtered, dismissEvent,
    highCount,
  };
}
