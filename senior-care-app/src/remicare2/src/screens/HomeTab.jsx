import { useState, useEffect, useRef } from "react";
import { T } from "../tokens";
import { Card, SectionLabel, Pill, ProgressRing, Divider, EmptyState } from "../components/UI";
import { useVitals } from "../hooks/useVitals";
import { useMedication } from "../hooks/useMedication";
import { useApp } from "../context/AppContext";
import { useSchedule } from "../hooks/useSchedule";

// ── Vitals Card ───────────────────────────────────────────────────
function VitalsCard() {
  const { vitals, animated, statusColor } = useVitals();

  return (
    <Card style={{ padding:0, overflow:"hidden", marginBottom:12 }}>
      {/* Status bar */}
      <div style={{ height:3, background:`linear-gradient(90deg,${statusColor},${statusColor}88)`, transition:"background .5s" }} />
      <div style={{ padding:"14px 16px" }}>
        <SectionLabel>
          실시간 바이탈
          <Pill color={statusColor} size={10} style={{ marginLeft:8 }}>
            <span style={{ animation:"pulse 2s infinite", display:"inline-block", width:5, height:5, borderRadius:"50%", background:statusColor, marginRight:3 }} />
            {vitals.status === "normal" ? "정상" : vitals.status === "caution" ? "주의" : "경고"}
          </Pill>
        </SectionLabel>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          {[
            { val: vitals.heartRate, unit:"bpm",  label:"심박수",   color:"#F06292", icon:"♥" },
            { val: vitals.steps || "5,432", unit:"걸음", label:"걸음수", color:T.green,  icon:"◆" },
            { val: vitals.oxygen,    unit:"%",    label:"혈중산소", color:T.teal,  icon:"◎" },
          ].map(v => (
            <div key={v.label} style={{ background:T.bg3, borderRadius:T.r.md, padding:"11px 10px" }}>
              <div style={{ fontSize:10, color:v.color, fontWeight:700, marginBottom:4, opacity:.8 }}>{v.icon} {v.label}</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:2 }}>
                <span key={`${v.val}`} style={{ fontSize:17, fontWeight:700, color:v.color, lineHeight:1, animation: animated?"countUp .3s ease both":undefined }}>
                  {v.val}
                </span>
                <span style={{ fontSize:9, color:T.t3 }}>{v.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize:10, color:T.t3, marginTop:8, fontFamily:"'DM Mono',monospace", textAlign:"right" }}>
          마지막 업데이트: {vitals.lastUpdated.toLocaleTimeString("ko-KR", { hour:"2-digit", minute:"2-digit", second:"2-digit" })}
        </div>
      </div>
    </Card>
  );
}

// ── Medication Card ───────────────────────────────────────────────
function MedicationCard() {
  const { meds, toggleTaken, stats, nextMed } = useMedication();
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <SectionLabel action={open?"접기":"상세보기"} onAction={() => setOpen(!open)}>
        복약 관리
      </SectionLabel>

      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <ProgressRing value={stats.taken} max={stats.total} size={56} stroke={5} color={stats.allDone ? T.green : T.teal} label={`/${stats.total}`} />
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:600, color:T.t1, marginBottom:4 }}>
            오늘 {stats.taken}/{stats.total} 복용 완료
          </div>
          <div style={{ height:5, background:T.bg4, borderRadius:99 }}>
            <div style={{ width:`${stats.pct}%`, height:"100%", background:stats.allDone?T.green:T.teal, borderRadius:99, transition:"width .6s ease", boxShadow:`0 0 8px ${stats.allDone?T.green:T.teal}66` }} />
          </div>
          <div style={{ fontSize:11, color:T.t3, marginTop:4 }}>
            {stats.allDone ? "✓ 모든 약 복용 완료" : nextMed ? `다음: ${nextMed.time} ${nextMed.name.split(" ")[0]}` : "남은 약 없음"}
          </div>
        </div>
      </div>

      {open && (
        <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8 }}>
          <Divider />
          {meds.map(med => (
            <div key={med.id} style={{ background:T.bg3, borderRadius:T.r.md, padding:"11px 13px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:med.color, boxShadow:`0 0 5px ${med.color}88` }} />
                <span style={{ fontSize:12, fontWeight:600, color:T.t1 }}>{med.name}</span>
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {med.times.map((t, ti) => (
                  <button key={ti} onClick={() => toggleTaken(med.id, ti)} style={{
                    display:"flex", alignItems:"center", gap:5,
                    padding:"5px 12px", borderRadius:99, fontSize:11, fontWeight:600, cursor:"pointer",
                    background:   med.taken[ti] ? `${med.color}22` : T.bg4,
                    border:`1px solid ${med.taken[ti] ? med.color : T.b2}`,
                    color:        med.taken[ti] ? med.color : T.t3,
                    transition:"all .15s",
                  }}>
                    {med.taken[ti] ? "✓" : "○"} {t}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div style={{ fontSize:11, color:T.t3 }}>*  수동 보정 </div>
        </div>
      )}
    </Card>
  );
}

// ── HomeCam Card ──────────────────────────────────────────────────
function HomeCamCard() {
  const { state } = useApp();
  const [cameras, setCameras] = useState(["거실"]);
  const [cam, setCam] = useState("거실");
  const [live, setLive] = useState(true);
  const [motion, setMotion] = useState(true);
  const [full, setFull] = useState(false);
  const reconnectTimerRef = useRef(null);

  // 설정 탭에서 저장한 서버 주소를 사용
  const streamUrl = state.aiServerUrl ? `${state.aiServerUrl}/video/feed` : null;

  // 서버 주소가 바뀌면 스트림 재시작
  useEffect(() => {
    setLive(true);
  }, [streamUrl]);

  // 끊기면 5초 후 자동 재연결
  useEffect(() => {
    if (!live && streamUrl) {
      reconnectTimerRef.current = setTimeout(() => setLive(true), 5000);
    }
    return () => clearTimeout(reconnectTimerRef.current);
  }, [live, streamUrl]);

  const handleAddCamera = () => {
    const newName = window.prompt("추가할 홈캠의 위치를 입력하세요 (예: 안방, 마당):");
    if (!newName || newName.trim() === "") return;
    if (cameras.includes(newName)) {
      alert("이미 추가된 위치입니다.");
      return;
    }
    setCameras(prev => [...prev, newName]);
    setCam(newName);
  };

  const CamView = ({ height = 220 }) => (
    <div style={{ position: "relative", background: "#000", height, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {!streamUrl ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#888", fontSize: 13 }}>서버 주소 미설정</span>
          <span style={{ color: "#666", fontSize: 11 }}>설정 탭에서 AI 서버 주소를 입력하세요</span>
        </div>
      ) : live ? (
        <img
          src={streamUrl}
          alt="Live Stream"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={() => setLive(false)}
        />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ color: "#fff", fontSize: 13 }}>연결 끊김 — 5초 후 자동 재연결</span>
          <button onClick={() => { clearTimeout(reconnectTimerRef.current); setLive(true); }} style={{ padding: "4px 10px", background: T.teal, color: "#fff", border: "none", borderRadius: 4, fontSize: 11, cursor: "pointer" }}>즉시 재연결</button>
        </div>
      )}

      {streamUrl && live && (
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff4d4f", animation: "pulse 1.5s infinite" }} />
          <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, textShadow: "0 0 4px rgba(0,0,0,0.5)" }}>REC</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Card style={{ padding: 0, overflow: "hidden", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px 10px" }}>
          <SectionLabel>홈캠 라이브</SectionLabel>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {motion && <Pill color={T.amber} dim={T.amberDim} border="rgba(251,191,36,.3)">움직임 감지</Pill>}
            <button onClick={() => setFull(true)} style={{ background: T.bg4, border: `1px solid ${T.b2}`, borderRadius: T.r.sm, padding: "4px 10px", fontSize: 11, cursor: "pointer", color: T.t2 }}>전체화면</button>
          </div>
        </div>
        <div style={{ display: "flex", borderTop: `1px solid ${T.b1}`, overflowX: "auto" }}>
          {cameras.map(loc => (
            <button key={loc} onClick={() => setCam(loc)} style={{ padding: "9px 12px", fontSize: 12, fontWeight: cam === loc ? 700 : 400, border: "none", background: "transparent", color: cam === loc ? T.teal : T.t3, borderBottom: `2px solid ${cam === loc ? T.teal : "transparent"}`, cursor: "pointer", transition: "color .15s,border-color .15s", whiteSpace: "nowrap" }}>{loc}</button>
          ))}
          <button onClick={handleAddCamera} style={{ padding: "9px 12px", fontSize: 12, fontWeight: 600, border: "none", background: "transparent", color: T.blue, cursor: "pointer", whiteSpace: "nowrap" }}>
            + 추가
          </button>
        </div>
        <CamView />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "10px 13px 13px" }}>
          {[
            { label: live ? "연결 중단" : "재연결", color: live ? T.red : T.green, dim: live ? T.redDim : T.greenDim, action: () => setLive(!live) },
            { label: `움직임 ${motion ? "ON" : "OFF"}`, color: motion ? T.amber : T.t3, dim: motion ? T.amberDim : T.bg4, action: () => setMotion(!motion) },
            { label: "스냅샷", color: T.teal, dim: T.tealDim, action: () => { } },
          ].map(b => (
            <button key={b.label} onClick={b.action} style={{ padding: "8px 0", borderRadius: T.r.sm, fontSize: 11, fontWeight: 600, cursor: "pointer", background: b.dim, border: `1px solid ${b.color}33`, color: b.color, transition: "opacity .15s" }}>{b.label}</button>
          ))}
        </div>
      </Card>

      {full && (
        <div style={{ position: "fixed", inset: 0, background: T.bg0, zIndex: 400, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${T.b1}` }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: T.t1 }}>RemiCare Cam — {cam}</span>
            <button onClick={() => setFull(false)} style={{ background: T.bg4, border: `1px solid ${T.b2}`, borderRadius: T.r.sm, padding: "6px 14px", color: T.t1, fontSize: 13, cursor: "pointer" }}>닫기</button>
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <CamView height="100%" />
          </div>
          <div style={{ display: "flex", borderTop: `1px solid ${T.b1}`, paddingBottom: 24, overflowX: "auto" }}>
            {cameras.map(loc => (
              <button key={loc} onClick={() => setCam(loc)} style={{ padding: "12px 16px", fontSize: 12, fontWeight: cam === loc ? 700 : 400, border: "none", background: "transparent", color: cam === loc ? T.teal : "rgba(0,0,0,.4)", borderTop: `2px solid ${cam === loc ? T.teal : "transparent"}`, cursor: "pointer", whiteSpace: "nowrap" }}>{loc}</button>
            ))}
            <button onClick={handleAddCamera} style={{ padding: "12px 16px", fontSize: 12, fontWeight: 600, border: "none", background: "transparent", color: T.blue, cursor: "pointer", whiteSpace: "nowrap" }}>
              + 추가
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Timeline ──────────────────────────────────────────────────────


function TimelineCard() {
  const { schedules, loading, removeSchedule, toggleSchedule } = useSchedule();
  const dotColor = { done:T.green, warn:T.amber, wait:T.t3 };
  const dayStr = ["일", "월", "화", "수", "목", "금", "토"][new Date().getDay()];

  return (
    <Card>
      <SectionLabel>
        오늘의 일정 ({dayStr}요일)
      </SectionLabel>

      <div style={{ marginTop:10 }}>
        {loading ? (
          <div style={{ padding:"20px", textAlign:"center", fontSize:12, color:T.t3 }}>로딩 중...</div>
        ) : schedules.length === 0 ? (
          <EmptyState icon="🗓" title="일정 없음" desc="일정이 등록되면 여기에 표시됩니다." />
        ) : (
          schedules.map((item, i) => (
            <div key={item.id} style={{ display:"flex", gap:12, paddingBottom:i<schedules.length-1?13:0 }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:38, flexShrink:0 }}>
                <div style={{ fontSize:10, color:T.t3, fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>{item.time}</div>
                {i<schedules.length-1 && <div style={{ flex:1, width:1, background:T.b1, marginTop:5 }} />}
              </div>
              <div style={{ marginTop:3, flexShrink:0, cursor:"pointer" }} onClick={() => toggleSchedule(item.id)}>
                <div style={{ width:9, height:9, borderRadius:"50%", background:item.isCompleted?T.green:T.t3, boxShadow:item.isCompleted?`0 0 5px ${T.green}66`:undefined }} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500, color:T.t1, lineHeight:1.4 }}>{item.title}</div>
                <div style={{ fontSize:11, marginTop:2, color:item.isCompleted?T.green:T.t3 }}>
                  {item.isCompleted ? "완료" : "예정"}
                </div>
              </div>
              <button onClick={() => removeSchedule(item.id)} style={{ background:"none", border:"none", color:T.t3, fontSize:12, cursor:"pointer" }}>✕</button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

// ── HomeTab ───────────────────────────────────────────────────────
export default function HomeTab() {
  const { state } = useApp();

  return (
    <div style={{ padding:"14px 14px 90px", overflowY:"auto", flex:1 }} className="tab-content">

      {/* AI Summary */}
      <div style={{
        background:"#EEF2FF",
        borderRadius:T.r.xl, border:`1px solid ${T.teal}30`,
        padding:"18px 20px", marginBottom:12, position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:140, height:140, borderRadius:"50%", border:`1px solid ${T.teal}18` }} />
        <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80, borderRadius:"50%", border:`1px solid ${T.teal}25` }} />
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:T.tealDim, border:`1px solid ${T.teal}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🤖</div>
          <span style={{ fontSize:11, fontWeight:700, color:T.teal, letterSpacing:1, textTransform:"uppercase" }}>AI 요약</span>
          <Pill color={T.teal} style={{ marginLeft:"auto", fontSize:10, animation:"pulse 2s infinite" }}>실시간</Pill>
        </div>
        <p style={{ fontSize:14, lineHeight:1.7, color:T.t1 }}>
          <strong style={{ color:T.t1 }}>{state.elder.name}</strong> 님은 현재 평온한 상태이며,
          아침 약 복용을 완료하셨습니다. 오늘 활동량은 평균 수준입니다.
        </p>
      </div>

      <VitalsCard />
      <HomeCamCard />
      <MedicationCard />
      <TimelineCard />

      {/* Device status */}
      <Card>
        <SectionLabel>기기 상태</SectionLabel>
        {[
          ["웨어러블 배터리", `${state.device.wearableBattery}%`, T.green],
          ["홈캠 연결",       state.device.camConnected ? "정상" : "오프라인", state.device.camConnected ? T.green : T.red],
          ["AI 낙상 감지",    state.device.aiActive ? "활성화" : "비활성화", state.device.aiActive ? T.teal : T.t3],
        ].map(([k,v,c], i, arr) => (
          <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom: i<arr.length-1?`1px solid ${T.b1}`:"none" }}>
            <span style={{ fontSize:13, color:T.t2 }}>{k}</span>
            <span style={{ fontSize:13, fontWeight:700, color:c }}>{v}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
