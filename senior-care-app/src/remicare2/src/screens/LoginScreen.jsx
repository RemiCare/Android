import { useState } from "react";
import { T } from "../tokens";
import { Input, Button } from "../components/UI";
import { useAuth } from "../hooks/useAuth";

export default function LoginScreen({ onLogin, onGoSignup }) {
  const [email,  setEmail]  = useState("");
  const [pw,     setPw]     = useState("");
  const [showPw, setShowPw] = useState(false);
  const { signIn, loading, error, setError } = useAuth();

  const handleLogin = async () => {
    const ok = await signIn(email, pw);
    if (ok) onLogin();
  };

  return (
    <div style={{ minHeight:"100vh", background:`radial-gradient(ellipse at 50% -10%, #0D2E2A 0%, ${T.bg0} 60%)`, display:"flex", flexDirection:"column" }}>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 28px 10px" }}>
        <div style={{
          width:72, height:72, borderRadius:22,
          background:T.tealDim, border:`1.5px solid rgba(45,212,191,.4)`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:34, marginBottom:20,
          boxShadow:"0 0 32px rgba(45,212,191,.15)",
          animation:"scaleIn .5s cubic-bezier(.34,1.56,.64,1) both",
}}>
  <img src={require('./RemiCare.png')} alt="logo"
    style={{ width: 54, height: 54, objectFit: "contain", borderRadius: 12 }} />
</div>
        <div style={{ fontSize:14, color:T.t3, animation:"fadeUp .4s .2s ease both" }}>
          RemiCare에 로그인하세요
        </div>
      </div>

      <div style={{
        background:T.bg1, borderRadius:"28px 28px 0 0",
        border:`1px solid ${T.b1}`, borderBottom:"none",
        padding:"32px 24px 48px",
        animation:"slideUp .5s .2s cubic-bezier(.22,1,.36,1) both",
      }}>
        <Input label="이메일" type="email" placeholder="example@email.com" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} />
        <Input
          label="비밀번호" type={showPw?"text":"password"} placeholder="••••••••"
          value={pw} onChange={e => { setPw(e.target.value); setError(""); }}
          rightEl={
            <button onClick={() => setShowPw(!showPw)} style={{ background:"none", border:"none", color:T.t3, cursor:"pointer", fontSize:12, fontWeight:600 }}>
              {showPw?"숨기기":"보기"}
            </button>
          }
        />

        <div style={{ textAlign:"right", marginTop:-6, marginBottom:20 }}>
          <button style={{ background:"none", border:"none", color:T.teal, fontSize:12, fontWeight:600, cursor:"pointer" }}>
            비밀번호를 잊으셨나요?
          </button>
        </div>

        {error && (
          <div style={{ background:T.redDim, border:`1px solid rgba(248,113,113,.3)`, borderRadius:T.r.sm, padding:"10px 14px", fontSize:13, color:T.red, marginBottom:16, animation:"fadeUp .2s ease both" }}>
            {error}
          </div>
        )}

        <Button onClick={handleLogin} loading={loading}>로그인</Button>

        <div style={{ display:"flex", alignItems:"center", gap:12, margin:"22px 0" }}>
          <div style={{ flex:1, height:1, background:T.b1 }} />
          <span style={{ fontSize:12, color:T.t3 }}>또는</span>
          <div style={{ flex:1, height:1, background:T.b1 }} />
        </div>

        <div style={{ display:"flex", gap:10 }}>
          {[["Apple"],["Google"]].map(([icon,name]) => (
            <button key={name} className="press" style={{
              flex:1, padding:"12px 0", borderRadius:T.r.md,
              background:T.bg3, border:`1px solid ${T.b2}`,
              color:T.t2, fontSize:13, fontWeight:600, cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:7,
            }}>
              <span style={{ fontSize:15 }}>{icon}</span> {name}로 계속
            </button>
          ))}
        </div>

        <div style={{ textAlign:"center", marginTop:28, fontSize:13, color:T.t3 }}>
          계정이 없으신가요?{" "}
          <button onClick={onGoSignup} style={{ background:"none", border:"none", color:T.teal, fontWeight:700, cursor:"pointer", fontSize:13 }}>
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}
