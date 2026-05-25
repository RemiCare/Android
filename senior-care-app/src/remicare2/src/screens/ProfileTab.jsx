import { useState, useRef, useEffect } from "react";
import { T } from "../tokens";
import { ZoneSelector } from "../components/ZoneSelector";
import { BASE_URL } from "../constants";
import { useApp } from "../context/AppContext";

const card = (extra = {}) => ({
  background: T.bg2, borderRadius: T.r.lg,
  border: `1px solid ${T.b1}`, padding: "16px 18px",
  marginBottom: 12, ...extra,
});

function Toggle({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)} style={{
      width: 44, height: 26, borderRadius: 99,
      background: on ? T.teal : T.bg4,
      border: `1px solid ${on ? T.teal : T.b2}`,
      position: "relative", cursor: "pointer",
      transition: "background .2s, border-color .2s",
      flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: 3,
        left: on ? 21 : 3,
        width: 18, height: 18, borderRadius: "50%",
        background: on ? T.bg0 : T.t3,
        transition: "left .2s",
        boxShadow: on ? `0 0 6px ${T.teal}88` : "none",
      }} />
    </div>
  );
}

function Row({ icon, label, value, danger, onClick, right }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "13px 0",
      borderBottom: `1px solid ${T.b1}`,
      cursor: onClick ? "pointer" : "default",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: T.r.sm,
        background: danger ? T.redDim : T.bg3,
        border: `1px solid ${danger ? "rgba(248,113,113,.2)" : T.b1}`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: danger ? T.red : T.t1 }}>{label}</div>
        {value && <div style={{ fontSize: 12, color: T.t3, marginTop: 1 }}>{value}</div>}
      </div>
      {right || (onClick && <span style={{ color: T.t3, fontSize: 16 }}>›</span>)}
    </div>
  );
}

export default function ProfileTab({ onLogout }) {
  const [notifEmergency, setNotifEmergency] = useState(true);
  const [notifMed, setNotifMed] = useState(true);
  const [notifReport, setNotifReport] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  // --- 카메라 설정 관련 상태 ---
  const { state } = useApp();

  // --- 프로필 정보 가져오기 ---
  useEffect(() => {
    if (!state.user?.token) return;
    fetch(`${BASE_URL}/api/user/me`, {
      headers: { Authorization: `Bearer ${state.user.token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.results?.[0]) setProfile(data.results[0]); })
      .catch(() => {});
  }, [state.user?.token]);

  const displayName    = profile?.name    || state.user?.name  || "사용자";
  const displayEmail   = profile?.email   || state.user?.email || "이메일 정보 없음";
  const displayPhone   = profile?.phoneNumber || "-";
  const displayAddress = profile?.address || "-";
  const roleLabel = profile?.role === "ELDER" ? "어르신" : "보호자";

  const [camConfigOpen, setCamConfigOpen] = useState(false);
  const [configStep, setConfigStep] = useState(0); // 0: 거실, 1: 화장실
  const [tempZones, setTempZones] = useState({ b: null, c: null });
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  // 카메라 캔버스 애니메이션 (HomeTab에서 가져옴)
  useEffect(() => {
    if (!camConfigOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let f = 0;
    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx.fillStyle = "#E8E8E8"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.03)"; ctx.fillRect(0, h * .6, w, h * .4);
      // 가상 노이즈/도트 효과
      for (let i = 0; i < 4; i++) {
        const x = 50 + i * 80; const y = 80 + Math.sin(f * .05 + i) * 5;
        ctx.fillStyle = "rgba(0,0,0,0.05)"; ctx.beginPath();
        ctx.ellipse(x, y, 30, 10, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.font = "bold 10px monospace"; ctx.fillStyle = "rgba(45,212,191,0.5)";
      ctx.fillText(`● LIVE PREVIEW - CONFIG MODE`, 15, h - 15);
      f++; animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [camConfigOpen]);

  // 바이탈과 무관하게 기존 카메라 구역 정보를 서버에서 가져옴
  useEffect(() => {
    const fetchZones = async () => {
      if (!state.elder?.id) return;
      try {
        const response = await fetch(`${BASE_URL}/api/camera/zone/${state.elder.id}`, {
          headers: { "Authorization": `Bearer ${state.user.token}` }
        });
        if (response.ok) {
          const res = await response.json();
          if (res.results) {
            const data = res.results;
            setTempZones({
              b: { x: data.bX, y: data.bY, w: data.bW, h: data.bH },
              c: { x: data.cX, y: data.cY, w: data.cW, h: data.cH }
            });
          }
        }
      } catch (e) {
        console.log("Existing zones not found or fetch failed.");
      }
    };
    if (camConfigOpen) fetchZones();
  }, [camConfigOpen, state.elder?.id, state.user?.token]);

  const handleZoneComplete = (ratio) => {
    if (configStep === 0) {
      setTempZones(prev => ({ ...prev, b: ratio }));
      setConfigStep(1);
    } else {
      setTempZones(prev => ({ ...prev, c: ratio }));
      setConfigStep(2);
    }
  };

  const saveZones = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/camera/zone`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${state.user.token}`
        },
        body: JSON.stringify({
          elderlyId: state.elder?.id || 1,
          bX: tempZones.b.x, bY: tempZones.b.y, bW: tempZones.b.w, bH: tempZones.b.h,
          cX: tempZones.c.x, cY: tempZones.c.y, cW: tempZones.c.w, cH: tempZones.c.h
        })
      });
      if (response.ok) {
        // AI 서버(5000번 포트)에 즉시 갱신 신호 발송 (바이탈과 독립적)
        try {
          fetch(`http://192.168.1.100:5000/update_config`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ elderlyId: state.elder?.id || 1 })
          }).catch(() => console.log("AI Server update signal failed - but DB saved."));
        } catch (e) {}

        alert("카메라 감지 구역이 성공적으로 저장되었습니다.");
        setCamConfigOpen(false);
        setConfigStep(0);
      }
    } catch (e) {
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={{ padding: "16px 14px 90px", overflowY: "auto", flex: 1 }}>

      {/* Profile hero */}
      <div style={{ ...card(), padding: "22px 18px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: `linear-gradient(135deg, ${T.tealDim}, ${T.bg3})`,
            border: `2px solid ${T.teal}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, flexShrink: 0,
          }}>👤</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.t1 }}>{displayName}</div>
            <div style={{ fontSize: 13, color: T.t3, marginTop: 2 }}>{displayEmail}</div>
            <div style={{ fontSize: 12, color: T.t3, marginTop: 1 }}>{displayPhone}  ·  {displayAddress}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, background: T.tealDim, color: T.teal, borderRadius: 99, padding: "2px 10px", border: `1px solid ${T.tealBorder}` }}>{roleLabel}</span>
              <span style={{ fontSize: 11, fontWeight: 600, background: T.bg3, color: T.t3, borderRadius: 99, padding: "2px 10px", border: `1px solid ${T.b2}` }}>프리미엄</span>
            </div>
          </div>
          <button onClick={() => setEditOpen(true)} style={{
            background: T.bg3, border: `1px solid ${T.b2}`, borderRadius: T.r.sm,
            padding: "7px 12px", color: T.t2, fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>수정</button>
        </div>
      </div>

      {/* Elder info */}
      <div style={card()}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.t3, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>모니터링 중인 어르신</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 14, borderBottom: `1px solid ${T.b1}` }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: T.bg3, border: `2px solid ${T.b2}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>👩</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.t1 }}>김순자</div>
            <div style={{ fontSize: 12, color: T.t3, marginTop: 2 }}>78세 · 서울 마포구 · 딸</div>
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
              {["고혈압", "당뇨", "관절염"].map(c => (
                <span key={c} style={{ fontSize: 10, background: T.bg4, color: T.t3, borderRadius: 99, padding: "2px 8px", border: `1px solid ${T.b1}` }}>{c}</span>
              ))}
            </div>
          </div>
          <button style={{ background: T.bg3, border: `1px solid ${T.b2}`, borderRadius: T.r.sm, padding: "7px 12px", color: T.t2, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>편집</button>
        </div>
        <button style={{ width: "100%", marginTop: 12, padding: "10px 0", borderRadius: T.r.sm, background: "none", border: `1px dashed ${T.b2}`, color: T.t3, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + 어르신 추가하기
        </button>
      </div>

      {/* Notification settings */}
      <div style={card()}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.t3, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>알림 설정</div>
        {[
          { label: "응급 상황 알림", sub: "즉시 알림, 항상 켜기 권장", on: notifEmergency, set: setNotifEmergency },
          { label: "복약 알림", sub: "복용 시간 30분 전 알림", on: notifMed, set: setNotifMed },
          { label: "주간 리포트 알림", sub: "매주 월요일 오전 9시", on: notifReport, set: setNotifReport },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderBottom: `1px solid ${T.b1}` }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: T.t1 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: T.t3, marginTop: 2 }}>{item.sub}</div>
            </div>
            <Toggle on={item.on} onChange={item.set} />
          </div>
        ))}
      </div>

      {/* App settings */}
      <div style={card()}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.t3, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>앱 설정</div>
        <Row icon="📷" label="AI 카메라 구역 설정" value="낙상 및 위험 구역 지정" onClick={() => { setCamConfigOpen(true); setConfigStep(0); }} />
        <Row icon="🔗" label="기기 연결 관리" value="웨어러블 · 홈캠 1대" onClick={() => { }} />
        <Row icon="🔒" label="개인정보 보호" value="데이터 관리 및 동의" onClick={() => { }} />
        <Row icon="💳" label="구독 플랜" value="프리미엄 · ₩79,000/월" onClick={() => { }} />
        <Row icon="📋" label="오픈소스 라이선스" onClick={() => { }} />
        <Row icon="💬" label="고객센터 문의" onClick={() => { }} />
        <div style={{ paddingBottom: 0, borderBottom: "none" }}>
          <Row icon="ℹ️" label="앱 버전" value="v1.0.0 (최신)" />
        </div>
      </div>

      {/* Logout */}
      <div style={card()}>
        <Row icon="🚪" label="로그아웃" danger onClick={onLogout} />
        <div style={{ paddingTop: 0, borderBottom: "none" }}>
          <Row icon="⚠️" label="계정 탈퇴" danger onClick={() => { }} />
        </div>
      </div>

      {/* Edit modal */}
      {editOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setEditOpen(false)}>
          <div style={{ width: 420, background: T.bg2, borderRadius: "20px 20px 0 0", border: `1px solid ${T.b2}`, padding: "22px 22px 40px" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, background: T.b2, borderRadius: 99, margin: "0 auto 20px" }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: T.t1, marginBottom: 18 }}>프로필 수정</div>
            {["이름", "이메일", "휴대폰"].map(field => (
              <div key={field} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.t3, marginBottom: 6 }}>{field}</div>
                <input style={{ width: "100%", background: T.bg3, border: `1px solid ${T.b2}`, borderRadius: T.r.sm, padding: "12px 14px", fontSize: 14, color: T.t1, outline: "none" }}
                  placeholder={field === "이름" ? "홍길동" : field === "이메일" ? "example@email.com" : "010-0000-0000"} />
              </div>
            ))}
            <button style={{ width: "100%", marginTop: 8, padding: 14, background: T.teal, border: "none", borderRadius: T.r.md, fontSize: 14, fontWeight: 700, color: T.bg0, cursor: "pointer" }} onClick={() => setEditOpen(false)}>
              저장하기
            </button>
          </div>
        </div>
      )}

      {/* Camera Config Modal */}
      {camConfigOpen && (
        <div style={{ position: "fixed", inset: 0, background: T.bg0, zIndex: 400, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${T.b1}`, background: T.bg2 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: T.t1 }}>AI 카메라 구역 설정</span>
            <button onClick={() => setCamConfigOpen(false)} style={{ background: T.bg4, border: `1px solid ${T.b2}`, borderRadius: T.r.sm, padding: "6px 14px", color: T.t1, fontSize: 13, cursor: "pointer" }}>닫기</button>
          </div>

          <div style={{ flex: 1, position: "relative", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {configStep === 0 && (
              <ZoneSelector label="거실(B구역)" color={T.teal} onComplete={handleZoneComplete} />
            )}
            {configStep === 1 && (
              <ZoneSelector label="화장실(C구역)" color={T.amber} onComplete={handleZoneComplete} />
            )}
            {configStep === 2 && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 30 }}>
                <div style={{ color: "white", marginBottom: 20, fontSize: 15, fontWeight: 600 }}>설정한 구역을 저장할까요?</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={saveZones} style={{ background: T.teal, color: "white", border: "none", padding: "10px 24px", borderRadius: T.r.md, fontWeight: 700, cursor: "pointer" }}>저장하기</button>
                  <button onClick={() => setConfigStep(0)} style={{ background: "white", color: T.t1, border: "none", padding: "10px 24px", borderRadius: T.r.md, cursor: "pointer" }}>다시 설정</button>
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: "20px", background: T.bg2, borderTop: `1px solid ${T.b1}`, paddingBottom: 40 }}>
            <div style={{ fontSize: 12, color: T.t3, lineHeight: 1.6 }}>
              • 화면을 드래그하여 감지 구역을 사각형으로 그려주세요.<br />
              • <b>거실 구역</b>: 낙상 발생 시 주된 감지 영역입니다.<br />
              • <b>화장실 구역</b>: 어르신의 출입을 감지하는 입구 영역입니다.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
