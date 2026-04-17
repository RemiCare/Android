import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { T } from "../tokens";
import { Card, SectionLabel, Pill, ProgressRing, Divider, EmptyState, Button } from "../components/UI";
import { useEmergency, SEV, EMERGENCY_HISTORY } from "../hooks/useEmergency";

const weeklyData  = [
  { label:"월", activity:45, outing:80, sleep:70 },
  { label:"화", activity:60, outing:60, sleep:75 },
  { label:"수", activity:52, outing:40, sleep:65 },
  { label:"목", activity:70, outing:55, sleep:80 },
  { label:"금", activity:48, outing:30, sleep:60 },
  { label:"토", activity:65, outing:20, sleep:55 },
  { label:"일", activity:72, outing:22, sleep:71 },
];
const monthlyData = Array.from({length:30},(_,i)=>({ label:`${i+1}`, activity:45+Math.round(Math.sin(i*.4)*15), outing:Math.max(5,80-i*2), sleep:65+Math.round(Math.sin(i*.3)*10) }));

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:T.bg3, border:`1px solid ${T.b2}`, borderRadius:T.r.sm, padding:"8px 12px" }}>
      <div style={{ fontSize:11, color:T.t3, marginBottom:4 }}>{label}</div>
      {payload.map(p => <div key={p.name} style={{ fontSize:11, color:p.color, fontWeight:600 }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

function EmergencyBriefing() {
  const { filter, setFilter, selectedId, toggleSelected, filtered, dismissEvent, highCount } = useEmergency();

  return (
    <Card>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <SectionLabel>AI 응급 브리핑</SectionLabel>
        {highCount > 0 && <Pill color={T.red} dim={T.redDim} border="rgba(248,113,113,.3)">{highCount}건 고위험</Pill>}
      </div>
      <div style={{ display:"flex", gap:5, marginBottom:12 }}>
        {["all","high","mid","low"].map(f => {
          const s = SEV[f]; const active = filter===f;
          return (
            <button key={f} onClick={() => setFilter(f)} style={{ padding:"4px 10px", borderRadius:99, fontSize:10, fontWeight:700, cursor:"pointer", border:`1px solid ${active?(s?.color||T.teal)+"55":T.b2}`, background:active?(s?.bg||T.tealDim):T.bg4, color:active?(s?.color||T.teal):T.t3, transition:"all .15s" }}>
              {f==="all"?"전체":s.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0
        ? <EmptyState icon="✓" title="이상 없음" desc="선택한 기간에 응급 이벤트가 없습니다." />
        : (
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {filtered.map(ev => {
              const s = SEV[ev.severity]; const isOpen = selectedId === ev.id;
              return (
                <div key={ev.id} className="card-hover" style={{ borderRadius:T.r.md, overflow:"hidden", border:`1px solid ${s.border}` }}>
                  <div onClick={() => toggleSelected(ev.id)} style={{ background:s.bg, padding:"10px 13px" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:7, height:7, borderRadius:"50%", background:s.color, boxShadow:`0 0 5px ${s.color}` }} />
                        <span style={{ fontSize:13, fontWeight:700, color:s.color }}>{ev.type}</span>
                        <span style={{ fontSize:10, background:"rgba(0,0,0,.12)", color:s.color, borderRadius:6, padding:"1px 7px" }}>{ev.source}</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:11, fontWeight:700, color:s.color }}>신뢰도 {ev.confidence}%</span>
                        <span style={{ fontSize:10, color:s.color }}>{isOpen?"▲":"▼"}</span>
                      </div>
                    </div>
                    <div style={{ fontSize:10, color:s.color, opacity:.7, marginTop:3, fontFamily:"'DM Mono',monospace" }}>{ev.date}</div>
                  </div>
                  {isOpen && (
                    <div style={{ background:T.bg3, padding:"12px 14px", borderTop:`1px solid ${s.border}`, animation:"fadeUp .2s ease both" }}>
                      <p style={{ fontSize:12, lineHeight:1.7, color:T.t2 }}>{ev.detail}</p>
                      <div style={{ display:"flex", gap:8, marginTop:10 }}>
                        <button style={{ flex:1, padding:"8px 0", borderRadius:T.r.sm, fontSize:11, fontWeight:700, background:s.bg, border:`1px solid ${s.border}`, color:s.color, cursor:"pointer" }}>복지사 공유</button>
                        <button onClick={() => dismissEvent(ev.id)} style={{ flex:1, padding:"8px 0", borderRadius:T.r.sm, fontSize:11, fontWeight:600, background:T.bg4, border:`1px solid ${T.b2}`, color:T.t3, cursor:"pointer" }}>무시</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      }
    </Card>
  );
}

function SppbCard() {
  const [open, setOpen] = useState(false);
  const data = { total:8, max:12, items:[
    { name:"균형 검사", score:3, max:4, note:"한발 서기 8초" },
    { name:"보행 속도", score:2, max:4, note:"4m 걷기 6.2초" },
    { name:"의자 앉기/서기", score:3, max:4, note:"5회 반복 14.3초" },
  ]};
  const sc = data.total>=10?T.green:data.total>=7?T.amber:T.red;
  const lbl= data.total>=10?"낮은 위험":data.total>=7?"중간 위험":"높은 위험";
  return (
    <Card>
      <SectionLabel>SPPB 보행 분석</SectionLabel>
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:12 }}>
        <ProgressRing value={data.total} max={data.max} size={72} stroke={6} color={sc} label={`/${data.max}`} />
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <span style={{ fontSize:15, fontWeight:700, color:sc }}>{lbl}</span>
            <Pill color={sc} size={10}>AI 분석</Pill>
          </div>
          <div style={{ fontSize:12, color:T.t2, lineHeight:1.6 }}>낙상 위험 중간 수준<br/>정형외과 방문 권장</div>
          <div style={{ fontSize:10, color:T.t3, marginTop:4, fontFamily:"'DM Mono',monospace" }}>2026.04.07 측정</div>
        </div>
      </div>
      <button onClick={() => setOpen(!open)} style={{ width:"100%", padding:"9px 0", borderRadius:T.r.sm, fontSize:12, fontWeight:600, cursor:"pointer", background:T.bg4, border:`1px solid ${T.b2}`, color:T.t2 }}>
        {open ? "항목 접기" : "세부 항목 보기"}
      </button>
      {open && (
        <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:10 }}>
          <Divider />
          {data.items.map(item => (
            <div key={item.name}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:5 }}>
                <span style={{ color:T.t2 }}>{item.name}</span>
                <span style={{ fontWeight:700, color:sc }}>{item.score}/{item.max}</span>
              </div>
              <div style={{ height:4, background:T.bg4, borderRadius:99 }}>
                <div style={{ width:`${item.score/item.max*100}%`, height:"100%", background:sc, borderRadius:99, boxShadow:`0 0 5px ${sc}55` }} />
              </div>
              <div style={{ fontSize:10, color:T.t3, marginTop:2 }}>{item.note}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function InsightsTab() {
  const [period, setPeriod]       = useState("week");
  const [showSheet, setShowSheet] = useState(false);
  const [selPeriod, setSelPeriod] = useState("최근 1주일");
  const data = period==="week" ? weeklyData : monthlyData;

  return (
    <div style={{ padding:"14px 14px 90px", overflowY:"auto", flex:1 }} className="tab-content">
      <div style={{ display:"flex", gap:6, marginBottom:12 }}>
        {["week","month"].map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{ padding:"6px 16px", borderRadius:99, fontSize:12, fontWeight:600, cursor:"pointer", background:period===p?T.teal:T.bg4, color:period===p?T.bg0:T.t3, border:`1px solid ${period===p?T.teal:T.b2}`, transition:"all .15s" }}>
            {p==="week"?"주간":"월간"}
          </button>
        ))}
      </div>

      <Card>
        <SectionLabel>활동량 트렌드</SectionLabel>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={data} margin={{ top:4, right:4, bottom:0, left:-28 }}>
            <XAxis dataKey="label" tick={{ fontSize:9, fill:T.t3, fontFamily:"monospace" }} axisLine={false} tickLine={false} interval={period==="month"?6:0} />
            <YAxis tick={{ fontSize:9, fill:T.t3 }} axisLine={false} tickLine={false} domain={[0,100]} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="activity" stroke={T.teal}  strokeWidth={2} dot={false} name="활동량" />
            <Line type="monotone" dataKey="outing"   stroke={T.green} strokeWidth={2} dot={false} name="외출" />
            <Line type="monotone" dataKey="sleep"    stroke={T.amber} strokeWidth={2} dot={false} name="수면" strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display:"flex", gap:14, marginTop:8 }}>
          {[[T.teal,"활동량"],[T.green,"외출 빈도"],[T.amber,"수면 규칙성"]].map(([c,n]) => (
            <div key={n} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:12, height:2, background:c, borderRadius:1 }} />
              <span style={{ fontSize:10, color:T.t3 }}>{n}</span>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ background:T.amberDim, borderRadius:T.r.lg, border:`1px solid ${T.amber}33`, padding:"15px 17px", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
          <span>⚠</span>
          <span style={{ fontSize:11, fontWeight:700, color:T.amber, letterSpacing:.8, textTransform:"uppercase" }}>AI 건강 지침</span>
        </div>
        <p style={{ fontSize:13, lineHeight:1.7, color:"#D97706" }}>
          최근 2주간 <strong>외출 빈도 80% 감소</strong>, 낮잠 시간 증가. 가벼운 우울감이나 관절 통증이 원인일 수 있습니다. 이번 주말 산책을 권해 보세요.
        </p>
      </div>

      <Card>
        <SectionLabel>미세 건강 지표</SectionLabel>
        {[["수면 규칙성",71,T.blue],["외출 빈도",22,T.amber],["식사 규칙성",88,T.green]].map(([lbl,val,col]) => (
          <div key={lbl} style={{ marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:5 }}>
              <span style={{ color:T.t2 }}>{lbl}</span>
              <span style={{ fontWeight:700, color:col }}>{val}%</span>
            </div>
            <div style={{ height:4, background:T.bg4, borderRadius:99 }}>
              <div style={{ width:`${val}%`, height:"100%", background:col, borderRadius:99, boxShadow:`0 0 7px ${col}44`, transition:"width .6s ease" }} />
            </div>
          </div>
        ))}
      </Card>

      <EmergencyBriefing />
      <SppbCard />

      <Button onClick={() => setShowSheet(true)} style={{ background:`linear-gradient(135deg,#0F6E56,#1D9E75)`, boxShadow:"0 4px 20px rgba(29,158,117,.35)", color:"#fff" }}>
        🏥 병원 진료용 PDF 리포트 발급
      </Button>

      {showSheet && (
        <>
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:190 }} onClick={() => setShowSheet(false)} />
          <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:420, background:T.bg2, borderRadius:"20px 20px 0 0", border:`1px solid ${T.b2}`, padding:"22px 20px 34px", zIndex:200, animation:"slideUp .3s ease both" }}>
            <div style={{ width:36, height:4, background:T.b2, borderRadius:99, margin:"0 auto 18px" }} />
            <div style={{ fontSize:16, fontWeight:700, color:T.t1, marginBottom:5 }}>리포트 기간 선택</div>
            <div style={{ fontSize:13, color:T.t3, marginBottom:14 }}>병원 진료 시 제출하실 건강 리포트를 생성합니다.</div>
            <div style={{ display:"flex", gap:8, marginBottom:16 }}>
              {["최근 1주일","최근 1개월"].map(p => (
                <div key={p} onClick={() => setSelPeriod(p)} style={{ flex:1, padding:12, textAlign:"center", borderRadius:T.r.md, cursor:"pointer", border:`1px solid ${selPeriod===p?T.teal:T.b2}`, background:selPeriod===p?T.tealDim:T.bg3, color:selPeriod===p?T.teal:T.t3, fontSize:13, fontWeight:selPeriod===p?700:400, transition:"all .15s" }}>{p}</div>
              ))}
            </div>
            <Button onClick={() => { setShowSheet(false); alert("PDF 생성 중... (실제 환경에서는 jsPDF로 다운로드됩니다)"); }}>
              PDF 생성 및 다운로드
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
