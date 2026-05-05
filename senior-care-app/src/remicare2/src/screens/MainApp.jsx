import { T } from "../tokens";
import { useEmergency } from "../hooks/useEmergency";
import { useApp } from "../context/AppContext";
import HomeTab      from "./HomeTab";
import InsightsTab  from "./InsightsTab";
import { CareTab, ProfileTab } from "./CareAndProfile";

const TABS = [
  { id:"home",    icon:"⌂",  label:"홈" },
  { id:"insight", icon:"↗",  label:"인사이트" },
  { id:"care",    icon:"★",  label:"돌봄 연계" },
  { id:"profile", icon:"👤", label:"내 정보" },
];

function EmergencyModal({ status, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", zIndex:400, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:T.bg2, borderRadius:T.r.xl, padding:"32px 24px", width:320, textAlign:"center", border:`1px solid ${T.redDim}`, animation:"scaleIn .25s ease both" }}>
        <div style={{ position:"relative", width:64, height:64, margin:"0 auto 18px" }}>
          <div style={{ width:64, height:64, borderRadius:"50%", border:`3px solid ${T.red}`, borderTopColor:"transparent", animation:"spin .8s linear infinite", position:"absolute" }} />
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>📞</div>
        </div>
        <h3 style={{ fontSize:17, fontWeight:700, color:T.t1, marginBottom:8 }}>
          {status === "connecting" ? "비상 통화 연결 중..." : "통화 연결됨"}
        </h3>
        <p style={{ fontSize:13, color:T.t3, marginBottom:22, lineHeight:1.6 }}>
          {status === "connecting"
            ? "홈캠 · 스피커 권한을 요청 중입니다.\n잠시 후 양방향 통화가 시작됩니다."
            : "어머니와 양방향 통화 중입니다.\n마이크 아이콘을 눌러 음소거하세요."
          }
        </p>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:12, borderRadius:T.r.md, background:T.bg4, border:`1px solid ${T.b2}`, color:T.t2, fontSize:13, fontWeight:600, cursor:"pointer" }}>종료</button>
          {status === "connected" && (
            <button style={{ flex:1, padding:12, borderRadius:T.r.md, background:T.tealDim, border:`1px solid ${T.teal}55`, color:T.teal, fontSize:13, fontWeight:600, cursor:"pointer" }}>🔇 음소거</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MainApp({ tab, setTab }) {
  const { state }                                    = useApp();
  const { callOpen, callStatus, openCall, closeCall } = useEmergency();

  return (
    <div style={{ maxWidth:420, margin:"0 auto", fontFamily:"'Outfit',sans-serif", background:T.bg1, minHeight:"100vh", display:"flex", flexDirection:"column" }}>

      {/* Header */}
      <div style={{ background:T.bg0, borderBottom:`1px solid ${T.b1}`, padding:"14px 18px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:T.tealDim, border:`1px solid ${T.teal}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>🌿</div>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:T.t1, letterSpacing:-.5 }}>RemiCare</div>
            <div style={{ fontSize:11, color:T.t3 }}>
              {state.elder.name} · {state.elder.address} · <span style={{ color:T.green }}>● 연결됨</span>
            </div>
          </div>
        </div>
        <button onClick={openCall} style={{ display:"flex", alignItems:"center", gap:7, background:T.redDim, color:T.red, border:`1px solid ${T.red}55`, borderRadius:99, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer", animation:"pulseRed 2s infinite" }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:T.red }} />
          비상 통화
        </button>
      </div>

      {/* Content */}
      {tab === "home"    && <HomeTab />}
      {tab === "insight" && <InsightsTab />}
      {tab === "care"    && <CareTab />}
      {tab === "profile" && <ProfileTab />}

      {/* Tab Bar */}
      <div style={{ display:"flex", background:T.bg0, borderTop:`1px solid ${T.b1}`, position:"sticky", bottom:0, zIndex:100 }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"10px 4px 8px", gap:4, cursor:"pointer", border:"none", background:"none", color:active?T.teal:T.t3 }}>
              <div style={{ width:24, height:24, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, background:active?T.tealDim:"transparent", transition:"background .2s" }}>{t.icon}</div>
              <span style={{ fontSize:10, fontWeight:active?700:400 }}>{t.label}</span>
              {active && <div style={{ width:16, height:2, background:T.teal, borderRadius:99, marginTop:-2 }} />}
            </button>
          );
        })}
      </div>

      {callOpen && <EmergencyModal status={callStatus} onClose={closeCall} />}
    </div>
  );
}
