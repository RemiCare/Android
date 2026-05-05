import { useState } from "react";
import { T } from "../tokens";

// ── Card ─────────────────────────────────────────────────────────
export function Card({ children, style, onClick }) {
  return (
    <div
      className={onClick ? "card-hover" : ""}
      onClick={onClick}
      style={{
        background: T.bg2, borderRadius: T.r.lg,
        border: `1px solid ${T.b1}`, padding: "15px 17px",
        marginBottom: 12, ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Section Label ─────────────────────────────────────────────────
export function SectionLabel({ children, action, onAction }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 10 }}>
      <div style={{ fontSize:10, fontWeight:700, color:T.t3, letterSpacing:1.1, textTransform:"uppercase" }}>
        {children}
      </div>
      {action && (
        <button onClick={onAction} style={{ background:"none", border:"none", fontSize:12, color:T.teal, cursor:"pointer", fontWeight:600 }}>
          {action}
        </button>
      )}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────
export function Input({ label, type="text", placeholder, value, onChange, hint, rightEl, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <div style={{ fontSize:12, fontWeight:600, color: error ? T.red : T.t3, marginBottom:7, letterSpacing:.4 }}>
          {label}
        </div>
      )}
      <div style={{
        display:"flex", alignItems:"center",
        background: T.bg3,
        border: `1px solid ${error ? T.red : focused ? T.teal : T.b2}`,
        borderRadius: T.r.md, transition:"border-color .2s, box-shadow .2s",
        boxShadow: focused && !error ? `0 0 0 3px rgba(45,212,191,0.1)` : error ? `0 0 0 3px rgba(248,113,113,0.1)` : "none",
      }}>
        <input
          type={type} placeholder={placeholder} value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ flex:1, background:"none", border:"none", outline:"none", padding:"13px 16px", fontSize:14, color:T.t1 }}
        />
        {rightEl && <div style={{ paddingRight:14 }}>{rightEl}</div>}
      </div>
      {hint  && !error && <div style={{ fontSize:11, color:T.t3, marginTop:5 }}>{hint}</div>}
      {error && <div style={{ fontSize:11, color:T.red, marginTop:5 }}>{error}</div>}
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────
export function Button({ children, onClick, disabled, loading, variant="primary", style: extraStyle }) {
  const base = {
    width:"100%", padding:"14px 0", borderRadius:T.r.lg, border:"none",
    fontSize:15, fontWeight:700, cursor: disabled||loading ? "default" : "pointer",
    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
    transition:"all .2s",
  };
  const variants = {
    primary: {
      background: disabled||loading ? T.bg3 : `linear-gradient(135deg,#1DB89E,${T.teal})`,
      color: disabled||loading ? T.t3 : T.bg0,
      boxShadow: disabled||loading ? "none" : "0 4px 24px rgba(45,212,191,.3)",
    },
    ghost: {
      background: T.bg4, border:`1px solid ${T.b2}`,
      color: T.t2, boxShadow:"none",
    },
    danger: {
      background: T.redDim, border:`1px solid rgba(248,113,113,.3)`,
      color: T.red, boxShadow:"none",
    },
  };
  return (
    <button className="press" onClick={disabled||loading ? undefined : onClick} style={{ ...base, ...variants[variant], ...extraStyle }}>
      {loading
        ? <><div style={{ width:18, height:18, borderRadius:"50%", border:`2px solid rgba(45,212,191,.4)`, borderTopColor:T.teal, animation:"spin .7s linear infinite" }} /> 잠시만요...</>
        : children
      }
    </button>
  );
}

// ── Toggle ────────────────────────────────────────────────────────
export function Toggle({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)} style={{
      width:44, height:26, borderRadius:99,
      background: on ? T.teal : T.bg4,
      border:`1px solid ${on ? T.teal : T.b2}`,
      position:"relative", cursor:"pointer",
      transition:"background .2s, border-color .2s", flexShrink:0,
    }}>
      <div style={{
        position:"absolute", top:3,
        left: on ? 21 : 3,
        width:18, height:18, borderRadius:"50%",
        background: on ? T.bg0 : T.t3,
        transition:"left .2s",
        boxShadow: on ? `0 0 6px ${T.teal}88` : "none",
      }} />
    </div>
  );
}

// ── Progress Ring ─────────────────────────────────────────────────
export function ProgressRing({ value, max, size=64, stroke=5, color=T.teal, label }) {
  const r    = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = value / max;
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.b2} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${circ*pct} ${circ*(1-pct)}`} strokeLinecap="round"
          style={{ transition:"stroke-dasharray .6s ease" }} />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:size*.27, fontWeight:700, color, lineHeight:1 }}>{value}</span>
        {label && <span style={{ fontSize:size*.13, color:T.t3 }}>{label}</span>}
      </div>
    </div>
  );
}

// ── Pill / Badge ──────────────────────────────────────────────────
export function Pill({ children, color, dim, border, size=11, style: extra }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      background: dim || `${color}18`,
      color: color,
      border:`1px solid ${border || `${color}44`}`,
      borderRadius:99, padding:"2px 9px",
      fontSize:size, fontWeight:600, whiteSpace:"nowrap",
      ...extra,
    }}>
      {children}
    </span>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────
export function Skeleton({ width="100%", height=16, style: extra }) {
  return <div className="skeleton" style={{ width, height, ...extra }} />;
}

// ── Divider ───────────────────────────────────────────────────────
export function Divider({ margin="10px 0" }) {
  return <div style={{ height:1, background:T.b1, margin }} />;
}

// ── Empty State ───────────────────────────────────────────────────
export function EmptyState({ icon, title, desc }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"32px 20px", gap:10 }}>
      <div style={{ fontSize:40, opacity:.5 }}>{icon}</div>
      <div style={{ fontSize:14, fontWeight:600, color:T.t2 }}>{title}</div>
      {desc && <div style={{ fontSize:12, color:T.t3, textAlign:"center", lineHeight:1.6 }}>{desc}</div>}
    </div>
  );
}
