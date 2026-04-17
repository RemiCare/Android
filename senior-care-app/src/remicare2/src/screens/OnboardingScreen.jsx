import { useState } from "react";
import { T } from "../tokens";
import { Button } from "../components/UI";

const SLIDES = [
  { emoji:"🌿", title:"24시간\n안심 모니터링", desc:"웨어러블과 홈캠이 협력하여\n어르신의 응급 상황을 실시간으로 감지합니다.", color:T.teal, dim:T.tealDim },
  { emoji:"🤖", title:"AI가\n직접 브리핑",    desc:"단순 알림이 아닌, 상황의 원인과 근거를\n자연어로 설명해 드립니다.",             color:T.blue, dim:T.blueDim },
  { emoji:"💊", title:"복약·식사\n자동 체크",  desc:"AI가 웨어러블 데이터로 복약과 식사를\n자동으로 확인해 알려드립니다.",          color:T.green, dim:T.greenDim },
  { emoji:"🚑", title:"즉각적인\n돌봄 연계",   desc:"비응급 상황에도 요양보호사를\n즉시 연결해 드립니다.",                         color:T.amber, dim:T.amberDim },
];

export default function OnboardingScreen({ onDone }) {
  const [idx, setIdx] = useState(0);
  const slide  = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;

  return (
    <div style={{
      minHeight:"100vh",
      background:`radial-gradient(ellipse at 50% 0%, ${slide.dim} 0%, ${T.bg0} 60%)`,
      display:"flex", flexDirection:"column", transition:"background .5s ease",
    }}>
      <div style={{ display:"flex", justifyContent:"flex-end", padding:"56px 24px 0" }}>
        {!isLast && (
          <button onClick={onDone} style={{ background:"none", border:"none", color:T.t3, fontSize:13, fontWeight:600, cursor:"pointer" }}>
            건너뛰기
          </button>
        )}
      </div>

      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px 32px" }}>
        <div style={{ position:"relative", marginBottom:48 }}>
          {[1.6,1.3].map((scale,i) => (
            <div key={i} style={{
              position:"absolute", top:"50%", left:"50%",
              transform:`translate(-50%,-50%) scale(${scale})`,
              width:120, height:120, borderRadius:"50%",
              border:`1px solid ${slide.color}${i===0?"18":"30"}`,
            }} />
          ))}
          
          <div style={{
            width:120, height:120, borderRadius:"50%",
            background:slide.dim, border:`1px solid ${slide.color}55`,
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:`0 0 40px ${slide.color}30`,
            animation:"scaleIn .4s cubic-bezier(.34,1.56,.64,1) both",
          }}>
            {/* 👇 여기 경로를 ./RemiCare.png 로 수정했습니다! */}
            <img src={require('./RemiCare.png')} alt="logo"
              style={{ width: 54, height: 54, objectFit: "contain", borderRadius: 12 }} />
          </div>
        </div> 
        
        <div key={idx} className="fade-up" style={{ textAlign:"center" }}>
          <h2 style={{ fontSize:30, fontWeight:800, color:T.t1, lineHeight:1.25, letterSpacing:-1, marginBottom:16, whiteSpace:"pre-line" }}>
            {slide.title}
          </h2>
          <p style={{ fontSize:15, color:T.t2, lineHeight:1.7, whiteSpace:"pre-line" }}>
            {slide.desc}
          </p>
        </div>
      </div>

      <div style={{ padding:"0 28px 52px" }}>
        <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:28 }}>
          {SLIDES.map((_,i) => (
            <div key={i} onClick={() => setIdx(i)} style={{
              height:6, borderRadius:99, cursor:"pointer",
              width: i===idx ? 24 : 6,
              background: i===idx ? slide.color : T.b2,
              transition:"all .3s ease",
              boxShadow: i===idx ? `0 0 8px ${slide.color}77` : "none",
            }} />
          ))}
        </div>
        <Button onClick={() => isLast ? onDone() : setIdx(i => i+1)}
          style={{ background:`linear-gradient(135deg,${slide.dim},${slide.color}CC)`, color:T.bg0, boxShadow:`0 4px 24px ${slide.color}40` }}>
          {isLast ? "시작하기 →" : "다음"}
        </Button>
      </div>
    </div>
  );
}