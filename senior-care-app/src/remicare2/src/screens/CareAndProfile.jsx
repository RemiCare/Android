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
