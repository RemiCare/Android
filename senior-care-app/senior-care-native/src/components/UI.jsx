import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Animated } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { T } from "../tokens";

// ── Card ─────────────────────────────────────────────────────────
export function Card({ children, style, onPress }) {
  const Component = onPress ? TouchableOpacity : View;
  return (
    <Component
      onPress={onPress}
      activeOpacity={0.8}
      style={[{
        backgroundColor: T.bg2, borderRadius: T.r.lg,
        borderColor: T.b1, borderWidth: 1, paddingVertical: 15, paddingHorizontal: 17,
        marginBottom: 12,
      }, style]}
    >
      {children}
    </Component>
  );
}

// ── Section Label ─────────────────────────────────────────────────
export function SectionLabel({ children, action, onAction }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color: T.t3, letterSpacing: 1.1, textTransform: "uppercase" }}>
        {children}
      </Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={{ fontSize: 13, color: T.teal, fontWeight: "600" }}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Input ─────────────────────────────────────────────────────────
export function Input({ label, secureTextEntry, placeholder, value, onChangeText, hint, rightEl, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      {label && (
        <Text style={{ fontSize: 13, fontWeight: "600", color: error ? T.red : T.t3, marginBottom: 7, letterSpacing: 0.4 }}>
          {label}
        </Text>
      )}
      <View style={{
        flexDirection: "row", alignItems: "center",
        backgroundColor: T.bg3,
        borderColor: error ? T.red : focused ? T.teal : T.b2,
        borderWidth: 1,
        borderRadius: T.r.md,
      }}>
        <TextInput
          secureTextEntry={secureTextEntry}
          placeholder={placeholder}
          placeholderTextColor={T.t3}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ flex: 1, paddingVertical: 13, paddingHorizontal: 16, fontSize: 15, color: T.t1 }}
        />
        {rightEl && <View style={{ paddingRight: 14 }}>{rightEl}</View>}
      </View>
      {hint && !error && <Text style={{ fontSize: 12, color: T.t3, marginTop: 5 }}>{hint}</Text>}
      {error && <Text style={{ fontSize: 12, color: T.red, marginTop: 5 }}>{error}</Text>}
    </View>
  );
}

// ── Button ────────────────────────────────────────────────────────
export function Button({ children, onPress, disabled, loading, variant = "primary", style: extraStyle }) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  const isGhost = variant === "ghost";
  
  const bgColor = disabled || loading ? T.bg3 : isPrimary ? T.teal : isDanger ? T.redDim : T.bg4;
  const borderColor = disabled || loading ? "transparent" : isGhost ? T.b2 : isDanger ? "rgba(248,113,113,.3)" : "transparent";
  const textColor = disabled || loading ? T.t3 : isPrimary ? T.bg0 : isDanger ? T.red : T.t2;

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[{
        width: "100%", paddingVertical: 14, borderRadius: T.r.lg,
        backgroundColor: bgColor,
        borderColor: borderColor, borderWidth: isPrimary ? 0 : 1,
        alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8,
      }, extraStyle]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isPrimary ? T.bg0 : T.teal} />
      ) : (
        <Text style={{ fontSize: 16, fontWeight: "700", color: textColor }}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

// ── Toggle ────────────────────────────────────────────────────────
export function Toggle({ on, onChange }) {
  const anim = useRef(new Animated.Value(on ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: on ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [on]);

  const left = anim.interpolate({ inputRange: [0, 1], outputRange: [3, 21] });
  const bgColor = anim.interpolate({ inputRange: [0, 1], outputRange: [T.bg4, T.teal] });
  const borderColor = anim.interpolate({ inputRange: [0, 1], outputRange: [T.b2, T.teal] });
  const knobColor = anim.interpolate({ inputRange: [0, 1], outputRange: [T.t3, T.bg0] });

  return (
    <TouchableOpacity onPress={() => onChange(!on)} activeOpacity={0.9}>
      <Animated.View style={{
        width: 44, height: 26, borderRadius: 99,
        backgroundColor: bgColor, borderColor: borderColor, borderWidth: 1,
        justifyContent: "center"
      }}>
        <Animated.View style={{
          position: "absolute", left: left,
          width: 18, height: 18, borderRadius: 9,
          backgroundColor: knobColor,
        }} />
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Progress Ring ─────────────────────────────────────────────────
export function ProgressRing({ value, max, size = 64, stroke = 5, color = T.teal, label }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = value / max;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.b2} strokeWidth={stroke} />
        <Circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${circ * pct} ${circ * (1 - pct)}`} strokeLinecap="round" />
      </Svg>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: size * 0.27, fontWeight: "700", color: color }}>{value}</Text>
        {label && <Text style={{ fontSize: size * 0.15, color: T.t3 }}>{label}</Text>}
      </View>
    </View>
  );
}

// ── Pill / Badge ──────────────────────────────────────────────────
export function Pill({ children, color, dim, border, size = 11, style: extra }) {
  return (
    <View style={[{
      flexDirection: "row", alignItems: "center",
      backgroundColor: dim || `${color}18`,
      borderColor: border || `${color}44`, borderWidth: 1,
      borderRadius: 99, paddingVertical: 2, paddingHorizontal: 9,
    }, extra]}>
      {typeof children === "string" ? (
        <Text style={{ fontSize: size, fontWeight: "600", color: color }}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────
export function Skeleton({ width = "100%", height = 16, style: extra }) {
  const anim = useRef(new Animated.Value(0.3)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, []);

  return <Animated.View style={[{ width, height, backgroundColor: T.bg3, borderRadius: 6, opacity: anim }, extra]} />;
}

// ── Divider ───────────────────────────────────────────────────────
export function Divider({ marginVertical = 10 }) {
  return <View style={{ height: 1, backgroundColor: T.b1, marginVertical }} />;
}

// ── Empty State ───────────────────────────────────────────────────
export function EmptyState({ icon, title, desc }) {
  return (
    <View style={{ alignItems: "center", paddingVertical: 32, paddingHorizontal: 20 }}>
      <View style={{ opacity: 0.5, marginBottom: 10 }}>{icon}</View>
      <Text style={{ fontSize: 16, fontWeight: "600", color: T.t2, marginBottom: 6 }}>{title}</Text>
      {desc && <Text style={{ fontSize: 13, color: T.t3, textAlign: "center", lineHeight: 20 }}>{desc}</Text>}
    </View>
  );
}
