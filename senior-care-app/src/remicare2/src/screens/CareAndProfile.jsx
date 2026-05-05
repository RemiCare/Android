import { useState } from "react";
import { T } from "../tokens";
import { Card, SectionLabel, Toggle, Divider, Button } from "../components/UI";
import { useApp } from "../context/AppContext";
import { useAuth } from "../hooks/useAuth";

const CARE_BTNS = [
  { icon:"💊", label:"약국 심부름",   color:T.teal  },
  { icon:"🏃", label:"낙상 확인",     color:T.red   },
  { icon:"💡", label:"전구 교체",     color:T.amber },
  { icon:"🔍", label:"방문 확인",     color:T.blue  },
];

function StepBar({ current }) {
  const steps = ["요청","매칭","출동","완료"];
  return (
    <div style={{ display:"flex", alignItems:"flex-start", margin:"12px 0 10px" }}>
      {steps.map((lbl,i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", flex:i<steps.length-1?1:"none" }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <div style={{ width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700,
              background:i<current?T.teal:i===current?T.tealDim:"transparent",
              color:i<current?T.bg0:i===current?T.teal:T.t3,
              border:`2px solid ${i<current?T.teal:i===current?T.teal:T.b2}`,
              boxShadow:i===current?`0 0 10px ${T.teal}55`:undefined,
            }}>{i<current?"✓":i+1}</div>
            <div style={{ fontSize:9, color:i===current?T.teal:T.t3, fontWeight:i===current?600:400, textAlign:"center", maxWidth:44, lineHeight:1.3 }}>{lbl}</div>
          </div>
          {i<steps.length-1 && <div style={{ flex:1, height:1.5, background:i<current?T.teal:T.b2, margin:"0 3px 18px", transition:"background .3s" }} />}
        </div>
      ))}
    </div>
  );
}

export function CareTab() {
  const [modal, setModal] = useState(null);
  return (
    <div style={{ padding:"14px 14px 90px", overflowY:"auto", flex:1 }} className="tab-content">
      <div style={{ fontSize:10, fontWeight:700, color:T.t3, letterSpacing:1.1, textTransform:"uppercase", marginBottom:10 }}>빠른 호출</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
        {CARE_BTNS.map(btn => (
          <div key={btn.label} className="card-hover" onClick={() => setModal(btn.label)} style={{ background:T.bg2, border:`1px solid ${btn.color}22`, borderRadius:T.r.lg, padding:"18px 14px", display:"flex", flexDirection:"column", alignItems:"center", gap:10, cursor:"pointer" }}>
            <div style={{ width:46, height:46, borderRadius:14, background:`${btn.color}18`, border:`1px solid ${btn.color}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{btn.icon}</div>
            <div style={{ fontSize:12, fontWeight:600, textAlign:"center", color:T.t1 }}>{btn.label}</div>
          </div>
        ))}
      </div>

      <Card>
        <SectionLabel>출동 현황</SectionLabel>
        <StepBar current={1} />
        <div style={{ background:T.bg3, borderRadius:T.r.sm, padding:"10px 14px", fontSize:12, color:T.t3, border:`1px solid ${T.b1}` }}>약국 심부름 · 요양보호사 매칭 중...</div>
      </Card>

      <Card>
        <SectionLabel>지난 방문 결과</SectionLabel>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
          {[["💊","혈압약 전달 완료",T.teal],["💡","형광등 교체 완료",T.amber]].map(([icon,cap,c]) => (
            <div key={cap} style={{ background:T.bg3, borderRadius:T.r.md, padding:"14px 10px", textAlign:"center", border:`1px solid ${c}22` }}>
              <div style={{ fontSize:28, marginBottom:7 }}>{icon}</div>
              <div style={{ fontSize:11, color:T.t2, fontWeight:500 }}>{cap}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:12, color:T.t3, lineHeight:1.6 }}>어머니께서 컨디션이 좋으셨습니다. 약 정리도 함께 도와드렸습니다.</div>
      </Card>

      {modal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={() => setModal(null)}>
          <div style={{ background:T.bg2, borderRadius:T.r.xl, padding:"28px 24px", width:320, textAlign:"center", border:`1px solid ${T.b2}`, animation:"scaleIn .25s ease both" }} onClick={e => e.stopPropagation()}>
            <div style={{ width:52, height:52, borderRadius:"50%", background:T.tealDim, border:`2px solid ${T.teal}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, margin:"0 auto 14px" }}>✓</div>
            <h3 style={{ fontSize:16, fontWeight:700, color:T.t1, marginBottom:8 }}>{modal} 요청 완료</h3>
            <p style={{ fontSize:13, color:T.t3, marginBottom:20, lineHeight:1.6 }}>요양보호사 매칭을 시작합니다.<br/>잠시 후 연락이 드려집니다.</p>
            <Button onClick={() => setModal(null)}>확인</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ProfileTab ────────────────────────────────────────────────────
function SettingRow({ icon, label, value, danger, onClick, right }) {
  return (
    <div onClick={onClick} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 0", borderBottom:`1px solid ${T.b1}`, cursor:onClick?"pointer":"default" }}>
      <div style={{ width:36, height:36, borderRadius:T.r.sm, background:danger?T.redDim:T.bg3, border:`1px solid ${danger?"rgba(248,113,113,.2)":T.b1}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{icon}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14, fontWeight:500, color:danger?T.red:T.t1 }}>{label}</div>
        {value && <div style={{ fontSize:12, color:T.t3, marginTop:1 }}>{value}</div>}
      </div>
      {right || (onClick && !right && <span style={{ color:T.t3, fontSize:16 }}>›</span>)}
    </div>
  );
}

export function ProfileTab() {
  const { state }            = useApp();
  const { signOut }          = useAuth();
  const [notifs, setNotifs]  = useState({ emergency:true, med:true, report:false });
  const [editOpen,setEdit]   = useState(false);

  return (
    <div style={{ padding:"14px 14px 90px", overflowY:"auto", flex:1 }} className="tab-content">

      {/* Hero */}
      <Card style={{ padding:"20px 18px", marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:62, height:62, borderRadius:"50%", background:`linear-gradient(135deg,${T.tealDim},${T.bg3})`, border:`2px solid ${T.teal}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>👤</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:17, fontWeight:700, color:T.t1 }}>{state.user?.name || "홍길동"}</div>
            <div style={{ fontSize:12, color:T.t3, marginTop:2 }}>{state.user?.email || "example@email.com"}</div>
            <div style={{ display:"flex", gap:6, marginTop:8 }}>
              <span style={{ fontSize:11, fontWeight:600, background:T.tealDim, color:T.teal, borderRadius:99, padding:"2px 10px", border:`1px solid ${T.tealBorder}` }}>보호자</span>
              <span style={{ fontSize:11, fontWeight:600, background:T.bg3, color:T.t3, borderRadius:99, padding:"2px 10px", border:`1px solid ${T.b2}` }}>프리미엄</span>
            </div>
          </div>
          <button onClick={() => setEdit(true)} style={{ background:T.bg3, border:`1px solid ${T.b2}`, borderRadius:T.r.sm, padding:"7px 12px", color:T.t2, fontSize:12, fontWeight:600, cursor:"pointer" }}>수정</button>
        </div>
      </Card>

      {/* Elder */}
      <Card>
        <SectionLabel>모니터링 중인 어르신</SectionLabel>
        <div style={{ display:"flex", alignItems:"center", gap:13, paddingBottom:14, borderBottom:`1px solid ${T.b1}` }}>
          <div style={{ width:50, height:50, borderRadius:"50%", background:T.bg3, border:`2px solid ${T.b2}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>👩</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:700, color:T.t1 }}>{state.elder.name}</div>
            <div style={{ fontSize:12, color:T.t3, marginTop:2 }}>{state.elder.age}세 · {state.elder.address}</div>
            <div style={{ display:"flex", gap:5, marginTop:6, flexWrap:"wrap" }}>
              {state.elder.conditions.map(c => (
                <span key={c} style={{ fontSize:10, background:T.bg4, color:T.t3, borderRadius:99, padding:"2px 8px", border:`1px solid ${T.b1}` }}>{c}</span>
              ))}
            </div>
          </div>
          <button style={{ background:T.bg3, border:`1px solid ${T.b2}`, borderRadius:T.r.sm, padding:"7px 12px", color:T.t2, fontSize:12, fontWeight:600, cursor:"pointer" }}>편집</button>
        </div>
        <button style={{ width:"100%", marginTop:12, padding:"10px 0", borderRadius:T.r.sm, background:"none", border:`1px dashed ${T.b2}`, color:T.t3, fontSize:13, fontWeight:600, cursor:"pointer" }}>
          + 어르신 추가하기
        </button>
      </Card>

      {/* Notifications */}
      <Card>
        <SectionLabel>알림 설정</SectionLabel>
        {[
          { key:"emergency", label:"응급 상황 알림",   sub:"즉시 알림, 항상 켜기 권장" },
          { key:"med",       label:"복약 알림",        sub:"복용 시간 30분 전" },
          { key:"report",    label:"주간 리포트 알림", sub:"매주 월요일 오전 9시" },
        ].map(item => (
          <div key={item.key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:`1px solid ${T.b1}` }}>
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:T.t1 }}>{item.label}</div>
              <div style={{ fontSize:11, color:T.t3, marginTop:2 }}>{item.sub}</div>
            </div>
            <Toggle on={notifs[item.key]} onChange={v => setNotifs(p=>({...p,[item.key]:v}))} />
          </div>
        ))}
      </Card>

      {/* App Settings */}
      <Card>
        <SectionLabel>앱 설정</SectionLabel>
        <SettingRow icon="🔗" label="기기 연결 관리"   value="웨어러블 · 홈캠 2대" onClick={()=>{}} />
        <SettingRow icon="🔒" label="개인정보 보호"    value="데이터 관리 및 동의"  onClick={()=>{}} />
        <SettingRow icon="💳" label="구독 플랜"        value="프리미엄 · ₩79,000/월" onClick={()=>{}} />
        <SettingRow icon="💬" label="고객센터 문의"    onClick={()=>{}} />
        <SettingRow icon="ℹ️" label="앱 버전"         value="v2.0.0" />
      </Card>

      <Card>
        <SettingRow icon="🚪" label="로그아웃" danger onClick={signOut} />
        <div style={{ borderBottom:"none" }}>
          <SettingRow icon="⚠️" label="계정 탈퇴" danger onClick={()=>{}} />
        </div>
      </Card>

      {/* Edit modal */}
      {editOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.65)", zIndex:300, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={() => setEdit(false)}>
          <div style={{ width:420, background:T.bg2, borderRadius:"20px 20px 0 0", border:`1px solid ${T.b2}`, padding:"22px 22px 40px", animation:"slideUp .3s ease both" }} onClick={e => e.stopPropagation()}>
            <div style={{ width:36, height:4, background:T.b2, borderRadius:99, margin:"0 auto 20px" }} />
            <div style={{ fontSize:16, fontWeight:700, color:T.t1, marginBottom:18 }}>프로필 수정</div>
            {["이름","이메일","휴대폰"].map(f => (
              <div key={f} style={{ marginBottom:12 }}>
                <div style={{ fontSize:11, fontWeight:600, color:T.t3, marginBottom:6 }}>{f}</div>
                <input style={{ width:"100%", background:T.bg3, border:`1px solid ${T.b2}`, borderRadius:T.r.sm, padding:"12px 14px", fontSize:14, color:T.t1, outline:"none" }} placeholder={f==="이름"?"홍길동":f==="이메일"?"example@email.com":"010-0000-0000"} />
              </div>
            ))}
            <Button onClick={() => setEdit(false)} style={{ marginTop:8 }}>저장하기</Button>
          </div>
        </div>
      )}
    </div>
  );
}
