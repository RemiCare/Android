import { useEffect } from "react";
import { T } from "../tokens";

export default function SplashScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:999,
      background:`radial-gradient(ellipse at 60% 30%, #0D2E2A 0%, ${T.bg0} 65%)`,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
    }}>
      {[160,220,290].map((size,i) => (
        <div key={i} style={{
          position:"absolute", width:size, height:size, borderRadius:"50%",
          border:`1px solid rgba(45,212,191,${0.12 - i*.03})`,
          animation:`shimmer ${2+i*.5}s ease infinite`, animationDelay:`${i*.3}s`,
        }} />
      ))}
      <div style={{
        width:88, height:88, borderRadius:26,
        background:`linear-gradient(135deg,${T.tealDim},#0F3A34)`,
        border:`1.5px solid rgba(45,212,191,.45)`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:40, marginBottom:24,
        animation:"logoReveal .8s cubic-bezier(.34,1.56,.64,1) both",
        boxShadow:`0 0 40px rgba(45,212,191,0.2)`,
}}>
  <img src={require('../screens/RemiCare.png')} alt="logo"
    style={{ width: 54, height: 54, objectFit: "contain", borderRadius: 12 }} />
</div>
      <div style={{ fontSize:14, color:T.t3, marginTop:8, animation:"fadeUp .5s .5s ease both" }}>
        AI 노인 응급 보호 플랫폼
      </div>
      <div style={{ display:"flex", gap:6, marginTop:52, animation:"fadeUp .5s .7s ease both" }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:T.teal, animation:`shimmer 1.2s ${i*.2}s ease infinite` }} />
        ))}
      </div>
    </div>
  );
}
