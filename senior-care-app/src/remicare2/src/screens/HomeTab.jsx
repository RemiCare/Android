import { useState, useEffect, useRef } from "react";
import { T } from "../tokens";
import { Card, SectionLabel, Pill, ProgressRing, Divider, EmptyState } from "../components/UI";
import { useVitals } from "../hooks/useVitals";
import { useMedication } from "../hooks/useMedication";
import { useApp } from "../context/AppContext";

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
            { val: vitals.heartRate, unit:"bpm",  label:"심박수",   color:T.green, icon:"♥" },
            // 👇 혈압 대신 '걸음수'로 수정된 부분입니다!
            { val: vitals.steps || "5,432", unit:"걸음", label:"걸음수", color:T.blue,  icon:"👣" },
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
  // 기본 카메라 1개로 초기 상태 설정
  const [cameras, setCameras] = useState(["거실"]);
  const [scenes, setScenes] = useState({
    거실: { bg: "#060D1A", dots: [[55, 85], [185, 58], [285, 92], [95, 118]] }
  });
  
  const [cam, setCam] = useState("거실");
  const [live, setLive] = useState(true);
  const [motion, setMotion] = useState(true);
  const [full, setFull] = useState(false);
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  // 카메라 추가 함수
  const handleAddCamera = () => {
    const newName = window.prompt("추가할 홈캠의 위치를 입력하세요 (예: 안방, 마당):");
    
    // 입력이 취소되었거나 빈 칸인 경우 무시
    if (!newName || newName.trim() === "") return;
    
    // 중복 이름 방지
    if (cameras.includes(newName)) {
      alert("이미 추가된 위치입니다.");
      return;
    }

    // 새 카메라를 위한 무작위 캔버스 효과(배경색, 움직임 좌표) 생성
    const randomBg = `#0${Math.floor(Math.random() * 9)}1${Math.floor(Math.random() * 9)}1${Math.floor(Math.random() * 9)}`;
    const randomDots = Array.from({ length: 3 }, () => [
      Math.floor(Math.random() * 250) + 50, 
      Math.floor(Math.random() * 100) + 50
    ]);

    setScenes(prev => ({ ...prev, [newName]: { bg: randomBg, dots: randomDots } }));
    setCameras(prev => [...prev, newName]);
    setCam(newName); // 추가 후 바로 새 카메라 화면으로 이동
  };

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); let f = 0;
    const draw = () => {
      const sc = scenes[cam]; const { width: w, height: h } = canvas;
      if (!sc) return; // 방어 코드

      ctx.fillStyle = sc.bg; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.03)"; ctx.fillRect(0, h * .6, w, h * .4);
      sc.dots.forEach(([x, y], i) => {
        const p = Math.sin(f * .025 + i) * 2;
        ctx.fillStyle = "rgba(255,255,255,0.055)"; ctx.beginPath();
        ctx.ellipse(x, y + p, 28 + i * 4, 10, 0, 0, Math.PI * 2); ctx.fill();
      });
      if (motion) {
        const px = 160 + Math.sin(f * .012) * 12;
        ctx.fillStyle = "rgba(45,212,191,0.22)"; ctx.beginPath();
        ctx.ellipse(px, 72, 9, 13, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(px - 7, 84, 14, 22);
        ctx.strokeStyle = "rgba(45,212,191,0.15)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(px, 80, 18, 24, 0, 0, Math.PI * 2); ctx.stroke();
      }
      const sy = (f * 1.2) % h; ctx.fillStyle = "rgba(45,212,191,0.025)"; ctx.fillRect(0, sy, w, 1);
      const now = new Date();
      const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      ctx.font = "bold 10px monospace"; ctx.fillStyle = "rgba(45,212,191,0.7)";
      ctx.fillText(ts, 10, h - 10); ctx.fillText(`● ${cam.toUpperCase()}`, w - 64, h - 10);
      if (live && f % 50 < 35) {
        ctx.fillStyle = "#E24B4A"; ctx.beginPath(); ctx.arc(10, 12, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.font = "bold 10px monospace"; ctx.fillText("REC", 20, 16);
      }
      f++; animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [cam, live, motion, scenes]);

  const CamView = ({ height = 220 }) => (
    <div style={{ position: "relative", background: T.bg0 }}>
      <canvas ref={canvasRef} width={392} height={height} style={{ width: "100%", display: "block" }} />
      {!live && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ color: T.t2, fontSize: 13 }}>연결 끊김</span>
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
          {/* 카메라 추가 버튼 */}
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
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <canvas ref={canvasRef} width={392} height={360} style={{ width: "100%" }} />
          </div>
          <div style={{ display: "flex", borderTop: `1px solid ${T.b1}`, paddingBottom: 24, overflowX: "auto" }}>
            {cameras.map(loc => (
              <button key={loc} onClick={() => setCam(loc)} style={{ padding: "12px 16px", fontSize: 12, fontWeight: cam === loc ? 700 : 400, border: "none", background: "transparent", color: cam === loc ? T.teal : "rgba(255,255,255,.35)", borderTop: `2px solid ${cam === loc ? T.teal : "transparent"}`, cursor: "pointer", whiteSpace: "nowrap" }}>{loc}</button>
            ))}
             {/* 전체화면 모드에서도 카메라 추가 버튼 지원 */}
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
  const [timeline, setTimeline] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // ⏳ 서버 데이터 로딩 상태
  const [isSaving, setIsSaving] = useState(false);  // 💾 서버 저장 중 상태

  const dotColor = { done:T.green, warn:T.amber, wait:T.t3 };
  const dayStr = ["일", "월", "화", "수", "목", "금", "토"][new Date().getDay()];

// 📡 1. [READ] 컴포넌트가 켜질 때 서버에서 데이터 가져오기 (GET)
  useEffect(() => {
    const fetchTimeline = async () => {
      setIsLoading(true);
      try {
        // 🟢 프론트엔드 테스트용: 서버에서 가져오는 척 0.5초 대기
        await new Promise(res => setTimeout(res, 500));
        
        const day = new Date().getDay(); // 0(일요일) ~ 6(토요일)
        let initialData = [];

        switch (day) {
          case 0: // 일요일
            initialData = [
              { id: 1, time:"09:00", label:"일요일 늦잠 및 기상", status:"done", note:"완료" },
              { id: 2, time:"10:30", label:"아침 겸 점심 식사", status:"wait", note:"예정" },
              { id: 3, time:"15:00", label:"종교 활동 / 휴식", status:"wait", note:"예정" },
            ];
            break;
          case 1: // 월요일
            initialData = [
              { id: 1, time:"07:30", label:"월요일 기상", status:"done", note:"완료" },
              { id: 2, time:"09:00", label:"방문 요양사 선생님 방문", status:"wait", note:"예정" },
              { id: 3, time:"12:00", label:"점심 식사 및 약 복용", status:"wait", note:"예정" },
            ];
            break;
          case 2: // 화요일
            initialData = [
              { id: 1, time:"08:00", label:"기상 및 아침 산책", status:"done", note:"완료" },
              { id: 2, time:"10:00", label:"복지관 문화교실", status:"wait", note:"예정" },
            ];
            break;
          case 3: // 수요일
            initialData = [
              { id: 1, time:"07:40", label:"기상", status:"done", note:"완료" },
              { id: 2, time:"14:00", label:"병원 정기 검진", status:"wait", note:"예정" },
              { id: 3, time:"18:00", label:"가족 저녁 식사", status:"wait", note:"예정" },
            ];
            break;
          case 4: // 목요일
            initialData = [
              { id: 1, time:"08:00", label:"기상 및 혈압 측정", status:"done", note:"완료" },
              { id: 2, time:"11:00", label:"오전 화상 통화", status:"wait", note:"예정" },
            ];
            break;
          case 5: // 금요일
            initialData = [
              { id: 1, time:"07:30", label:"기상", status:"done", note:"완료" },
              { id: 2, time:"15:00", label:"동네 경로당 방문", status:"wait", note:"예정" },
            ];
            break;
          case 6: // 토요일
            initialData = [
              { id: 1, time:"08:30", label:"주말 기상", status:"done", note:"완료" },
              { id: 2, time:"13:00", label:"가족 나들이", status:"wait", note:"예정" },
            ];
            break;
          default:
            initialData = [];
        }

        setTimeline(initialData);

      } catch (error) {
        console.error("데이터를 불러오는데 실패했습니다.", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTimeline();
  }, []);
  // 📡 2. [CREATE] 새 일정 추가 (POST) - 여기서는 화면에 빈 칸을 만들고 저장을 누를 때 한 번에 서버로 보냅니다.
  const handleAdd = () => {
    // 아직 서버에 저장되지 않은 임시 고유 ID (저장 시 서버 DB의 ID로 교체됨)
    const tempId = `temp_${Date.now()}`; 
    setTimeline([...timeline, { id: tempId, time:"12:00", label:"새 일정", status:"wait", note:"예정" }]);
  };

  // 📡 3. [DELETE] 일정 삭제 (DELETE)
  const handleRemove = async (id) => {
    if (String(id).startsWith('temp_')) {
      // 서버에 저장되지 않은 임시 데이터면 화면에서만 삭제
      setTimeline(timeline.filter(item => item.id !== id));
      return;
    }

    // 이미 서버에 있는 데이터면 삭제 API 호출
    if (window.confirm("이 일정을 삭제하시겠습니까?")) {
      try {
        /*
        // 🔴 실제 연동 시:
        await fetch(`/api/timeline/${id}`, { method: 'DELETE' });
        */
        setTimeline(timeline.filter(item => item.id !== id));
      } catch (error) {
        alert("삭제에 실패했습니다.");
      }
    }
  };

  // ⌨️ 화면 입력을 위한 로컬 상태 변경
  const handleChange = (id, field, value) => {
    setTimeline(timeline.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // 📡 4. [UPDATE/SAVE] 수정된 전체 일정을 서버에 전송 (PUT 또는 POST)
  const handleSave = async () => {
    setIsSaving(true);
    try {
      /*
      // 🔴 실제 연동 시: 백엔드로 전체 배열 전송
      await fetch('/api/timeline/save', {
        method: 'POST', // or PUT
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timeline)
      });
      */
      
      // 🟢 임시 시뮬레이션 (서버 저장 0.5초 대기)
      await new Promise(res => setTimeout(res, 500));
      setIsEditing(false); // 저장 완료 후 수정 모드 종료
    } catch (error) {
      alert("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  const sortedTimeline = [...timeline].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <Card>
      <SectionLabel 
        action={isLoading ? "로딩중..." : (isEditing ? (isSaving ? "저장 중..." : "저장") : "수정")} 
        onAction={() => {
          if (isLoading || isSaving) return;
          if (isEditing) {
            handleSave(); // 수정 모드일 때는 서버로 저장 API 쏘기
          } else {
            setIsEditing(true); // 일반 모드일 때는 수정 모드로 진입
          }
        }}
      >
        오늘의 일정 ({dayStr}요일)
      </SectionLabel>

      {/* 로딩 스피너 처리 */}
      {isLoading ? (
        <div style={{ padding:"20px", textAlign:"center", fontSize:12, color:T.t3 }}>데이터를 불러오는 중입니다...</div>
      ) : isEditing ? (
        /* ✏️ 수정 모드 UI */
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:10 }}>
          {sortedTimeline.map((item) => (
            <div key={item.id} style={{ display:"flex", gap:8, alignItems:"center", background:T.bg3, padding:"8px", borderRadius:T.r.sm }}>
              <input 
                type="time" 
                value={item.time} 
                onChange={(e) => handleChange(item.id, "time", e.target.value)}
                style={{ background:T.bg4, border:`1px solid ${T.b2}`, color:T.t1, borderRadius:T.r.sm, padding:"4px", outline:"none" }}
              />
              <input 
                type="text" 
                value={item.label} 
                onChange={(e) => handleChange(item.id, "label", e.target.value)}
                style={{ flex:1, background:T.bg4, border:`1px solid ${T.b2}`, color:T.t1, borderRadius:T.r.sm, padding:"4px 8px", outline:"none", fontSize:13 }}
              />
              <button 
                onClick={() => handleRemove(item.id)} 
                style={{ background:"transparent", border:"none", color:T.red, cursor:"pointer", fontWeight:700, padding:"4px" }}
              >
                ✕
              </button>
            </div>
          ))}
          <button 
            onClick={handleAdd} 
            style={{ marginTop:4, padding:"8px", background:T.bg4, border:`1px dashed ${T.teal}`, color:T.teal, borderRadius:T.r.sm, cursor:"pointer", fontSize:12, fontWeight:600 }}
          >
            + 새 일정 추가
          </button>
        </div>
      ) : (
        /* 👁️ 일반 보기 모드 UI */
        <div style={{ marginTop:10 }}>
          {sortedTimeline.length === 0 ? (
            <EmptyState icon="🗓" title="일정 없음" desc="우측 상단의 수정을 눌러 일정을 추가하세요." />
          ) : (
            sortedTimeline.map((item, i) => (
              <div key={item.id} style={{ display:"flex", gap:12, paddingBottom:i<sortedTimeline.length-1?13:0 }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:38, flexShrink:0 }}>
                  <div style={{ fontSize:10, color:T.t3, fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>{item.time}</div>
                  {i<sortedTimeline.length-1 && <div style={{ flex:1, width:1, background:T.b1, marginTop:5 }} />}
                </div>
                <div style={{ marginTop:3, flexShrink:0 }}>
                  <div style={{ width:9, height:9, borderRadius:"50%", background:dotColor[item.status]||T.t3, boxShadow:item.status==="done"?`0 0 5px ${T.green}66`:undefined }} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:T.t1, lineHeight:1.4 }}>{item.label}</div>
                  <div style={{ fontSize:11, marginTop:2, color:item.status==="done"?T.green:T.t3 }}>{item.note}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
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
        background:`linear-gradient(135deg,#0A2A24,#0D3328,#0A2218)`,
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
        <p style={{ fontSize:14, lineHeight:1.7, color:T.tealText }}>
          <strong style={{ color:T.teal }}>{state.elder.name}</strong> 님은 현재 평온한 상태이며,
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
