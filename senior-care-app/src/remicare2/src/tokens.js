export const T = {
  bg0: "#F5F5F5", bg1: "#F5F5F5", bg2: "#FFFFFF", bg3: "#F5F5F5", bg4: "#E8E8E8",
  teal: "#5C7CFA", tealDim: "#EEF2FF", tealText: "#3A5CF5", tealBorder: "rgba(92,124,250,0.3)",
  blue: "#7A96FF", blueDim: "#EEF2FF",
  green: "#4CAF82", greenDim: "#E8F5EE",
  amber: "#EAB308", amberDim: "#FEF9C3",
  red: "#E05555", redDim: "#FDEEF0",
  t1: "#111111", t2: "#222222", t3: "#444444",
  b1: "rgba(0,0,0,0.07)", b2: "rgba(0,0,0,0.13)", b3: "rgba(0,0,0,0.20)",
  r: { xs: 6, sm: 10, md: 14, lg: 18, xl: 24, full: 999 },
};

export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
  html, body { height:100%; }
  body { font-family:'Outfit',sans-serif; background:${T.bg0}; color:${T.t1}; overscroll-behavior:none; }
  ::-webkit-scrollbar { width:0; }
  input, button, textarea, select { font-family:'Outfit',sans-serif; }
  input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 100px ${T.bg3} inset !important;
    -webkit-text-fill-color: ${T.t1} !important;
  }
  @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes slideUp   { from{transform:translateY(100%)} to{transform:translateY(0)} }
  @keyframes slideDown { from{transform:translateY(-20px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes shimmer   { 0%{opacity:.4} 50%{opacity:1} 100%{opacity:.4} }
  @keyframes pulseRed  { 0%,100%{box-shadow:0 0 0 0 rgba(248,113,113,.45)} 50%{box-shadow:0 0 0 8px rgba(248,113,113,0)} }
  @keyframes scaleIn   { from{transform:scale(.88);opacity:0} to{transform:scale(1);opacity:1} }
  @keyframes logoReveal{ 0%{transform:scale(.7) rotate(-10deg);opacity:0} 60%{transform:scale(1.08) rotate(2deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
  @keyframes countUp   { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes tabSlide  { from{opacity:0;transform:translateX(8px)} to{opacity:1;transform:translateX(0)} }
  @keyframes skeletonPulse { 0%,100%{opacity:.3} 50%{opacity:.7} }

  .press { transition:transform .12s, opacity .12s; cursor:pointer; }
  .press:active { transform:scale(.96); opacity:.8; }
  .card-hover { transition:transform .15s; }
  .card-hover:active { transform:scale(.985); }
  .tab-content { animation:tabSlide .2s ease both; }
  .fade-up { animation:fadeUp .4s ease both; }
  .scale-in { animation:scaleIn .3s cubic-bezier(.34,1.56,.64,1) both; }
  .skeleton { animation:skeletonPulse 1.6s ease infinite; background:${T.bg3}; border-radius:6px; }
`;
