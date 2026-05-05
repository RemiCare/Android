import { useState } from "react";
import { T } from "../tokens";
import { Input, Button } from "../components/UI";
import { useAuth } from "../hooks/useAuth";

const STEPS    = ["계정 정보","보호자 정보","어르신 등록","완료"];
const RELATIONS= ["아들","딸","배우자","손자/손녀","형제/자매","기타"];
const CONDITIONS=["고혈압","당뇨","심장 질환","치매","관절염","뇌졸중","골다공증","파킨슨"];

function ChipSelect({ options, selected, onToggle }) {
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
      {options.map(o => {
        const on = selected.includes(o);
        return (
          <button key={o} onClick={() => onToggle(o)} style={{
            padding:"7px 14px", borderRadius:T.r.full, fontSize:12, fontWeight:600, cursor:"pointer",
            background: on ? T.tealDim : T.bg3,
            border:`1px solid ${on ? T.teal : T.b2}`,
            color: on ? T.teal : T.t2, transition:"all .15s",
          }}>{on ? "✓ " : ""}{o}</button>
        );
      })}
    </div>
  );
}

export default function SignupScreen({ onDone, onBack }) {
  const { signUp, loading, error, setError } = useAuth();
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    name:"", email:"", password:"",
    phone:"", relation:"",
    elderName:"", elderAge:"", elderAddr:"", conditions:[],
  });

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    setError(""); // 입력 시 에러 초기화
  };
  const toggleCondition = (c) => setForm(f => ({
    ...f, conditions: f.conditions.includes(c) ? f.conditions.filter(x=>x!==c) : [...f.conditions, c]
  }));

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = (phone) => /^010-?\d{3,4}-?\d{4}$/.test(phone);

  const goNext = async () => {
    setError("");

    // 단계별 유효성 검사
    if (step === 0) {
      if (!form.name) return setError("이름을 입력해주세요.");
      if (!form.email || !isEmailValid(form.email)) return setError("올바른 이메일 형식이 아닙니다.");
      if (!form.password || form.password.length < 10) return setError("비밀번호는 10자 이상이어야 합니다.");
    } else if (step === 1) {
      if (!form.phone || !isPhoneValid(form.phone)) return setError("올바른 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)");
      if (!form.relation) return setError("어르신과의 관계를 선택해주세요.");
    } else if (step === 2) {
      if (!form.elderName) return setError("어르신 성함을 입력해주세요.");
      if (!form.elderAddr) return setError("거주지 주소를 입력해주세요.");
    }

    if (step < 2) { 
      setStep(s => s+1); 
      return; 
    }

    const ok = await signUp(form);
    if (ok) setStep(3);
  };

  return (
    <div style={{ minHeight:"100vh", background:T.bg0, display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", alignItems:"center", padding:"56px 20px 20px", gap:12 }}>
        {step < 3 && (
          <button onClick={step===0 ? onBack : () => { setStep(s=>s-1); setError(""); }} style={{ width:38, height:38, borderRadius:T.r.md, background:T.bg3, border:`1px solid ${T.b2}`, color:T.t2, fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>‹</button>
        )}
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, color:T.t3, marginBottom:3 }}>{step < 3 ? `단계 ${step+1} / 3` : "완료"}</div>
          <div style={{ fontSize:18, fontWeight:700, color:T.t1 }}>{STEPS[step]}</div>
        </div>
      </div>

      {step < 3 && (
        <div style={{ height:3, background:T.b1, margin:"0 20px 28px" }}>
          <div style={{ height:"100%", background:T.teal, borderRadius:99, width:`${(step+1)/3*100}%`, transition:"width .4s ease", boxShadow:`0 0 8px ${T.teal}66` }} />
        </div>
      )}

      <div style={{ flex:1, padding:"0 24px", overflowY:"auto" }}>

        {error && (
          <div style={{ background:T.redDim, border:`1px solid rgba(248,113,113,.3)`, borderRadius:T.r.sm, padding:"10px 14px", fontSize:13, color:T.red, marginBottom:16 }}>
            {error}
          </div>
        )}

        {step === 0 && (
          <div className="fade-up">
            <p style={{ fontSize:22, fontWeight:700, color:T.t1, marginBottom:6 }}>안녕하세요!</p>
            <p style={{ fontSize:14, color:T.t3, marginBottom:28 }}>계정을 만들어 부모님을 지켜드리세요.</p>
            <Input label="이름" placeholder="홍길동" value={form.name} onChange={set("name")} />
            <Input label="이메일" type="email" placeholder="example@email.com" value={form.email} onChange={set("email")} />
            <Input label="비밀번호" type="password" placeholder="10자 이상" value={form.password} onChange={set("password")} hint="영문, 숫자 혼합 10자 이상" />
          </div>
        )}

        {step === 1 && (
          <div className="fade-up">
            <p style={{ fontSize:22, fontWeight:700, color:T.t1, marginBottom:6 }}>보호자 정보</p>
            <p style={{ fontSize:14, color:T.t3, marginBottom:28 }}>긴급 상황 시 연락할 정보를 입력해주세요.</p>
            <Input label="휴대폰 번호" type="tel" placeholder="010-0000-0000" value={form.phone} onChange={set("phone")} />
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:600, color:T.t3, marginBottom:10, letterSpacing:.4 }}>어르신과의 관계</div>
              <ChipSelect options={RELATIONS} selected={form.relation ? [form.relation] : []} onToggle={(r) => { setForm(f=>({...f,relation:r})); setError(""); }} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-up">
            <p style={{ fontSize:22, fontWeight:700, color:T.t1, marginBottom:6 }}>어르신 등록</p>
            <p style={{ fontSize:14, color:T.t3, marginBottom:24 }}>모니터링할 어르신의 정보를 입력해주세요.</p>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:22 }}>
              <div 
                onClick={() => alert("현재 사진 업로드 기능은 준비 중입니다. 기본 프로필로 가입이 진행됩니다.")}
                style={{ width:80, height:80, borderRadius:"50%", background:T.bg3, border:`2px dashed ${T.b2}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", gap:4 }}
              >
                <span style={{ fontSize:26 }}>👤</span>
                <span style={{ fontSize:10, color:T.t3 }}>사진 추가</span>
              </div>
            </div>
            <Input label="어르신 성함" placeholder="김순자" value={form.elderName} onChange={set("elderName")} />
            <Input label="나이" type="number" placeholder="78" value={form.elderAge} onChange={set("elderAge")} />
            <Input label="거주지 주소" placeholder="서울시 마포구..." value={form.elderAddr} onChange={set("elderAddr")} />
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:600, color:T.t3, marginBottom:10, letterSpacing:.4 }}>기저 질환</div>
              <ChipSelect options={CONDITIONS} selected={form.conditions} onToggle={toggleCondition} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="fade-up" style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingTop:40, textAlign:"center" }}>
            <div style={{
              width:96, height:96, borderRadius:"50%",
              background:T.tealDim, border:`3px solid ${T.teal}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:44, marginBottom:28,
              boxShadow:`0 0 40px rgba(45,212,191,.25)`,
              animation:"scaleIn .5s cubic-bezier(.34,1.56,.64,1) both",
            }}>✓</div>
            <div style={{ fontSize:26, fontWeight:800, color:T.t1, marginBottom:10 }}>가입 완료!</div>
            <div style={{ fontSize:14, color:T.t3, lineHeight:1.7, marginBottom:36 }}>
              {form.elderName || "어르신"} 님의 모니터링이<br />시작되었습니다.
            </div>
            <div style={{ width:"100%", background:T.bg2, borderRadius:T.r.lg, border:`1px solid ${T.b1}`, padding:"18px 20px", textAlign:"left" }}>
              {[["보호자",form.name||"홍길동"],["연락처",form.phone||"-"],["어르신",form.elderName||"김순자"],["관계",form.relation||"-"]].map(([k,v])=>(
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${T.b1}`, fontSize:13 }}>
                  <span style={{ color:T.t3 }}>{k}</span>
                  <span style={{ color:T.t1, fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding:"16px 24px 40px" }}>
        {step < 3
          ? <Button onClick={goNext} loading={loading}>{step===2?"가입 완료":"다음"}</Button>
          : <Button onClick={onDone}>시작하기 →</Button>
        }
      </div>
    </div>
  );
}
