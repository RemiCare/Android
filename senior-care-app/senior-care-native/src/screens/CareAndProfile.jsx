import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { T } from "../tokens";
import { Card, SectionLabel, Toggle, Divider, Button } from "../components/UI";
import { useApp } from "../context/AppContext";
import { useAuth } from "../hooks/useAuth";

const CARE_BTNS = [
  { icon: "💊", label: "약국 심부름", color: T.teal },
  { icon: "🏃", label: "낙상 확인", color: T.red },
  { icon: "💡", label: "전구 교체", color: T.amber },
  { icon: "🔍", label: "방문 확인", color: T.blue },
];

function StepBar({ current }) {
  const steps = ["요청", "매칭", "출동", "완료"];
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", marginVertical: 12 }}>
      {steps.map((lbl, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
          <View style={{ alignItems: "center", gap: 4 }}>
            <View style={{
              width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center",
              backgroundColor: i < current ? T.teal : i === current ? T.tealDim : "transparent",
              borderColor: i < current ? T.teal : i === current ? T.teal : T.b2, borderWidth: 2,
            }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: i < current ? T.bg0 : i === current ? T.teal : T.t3 }}>
                {i < current ? "✓" : i + 1}
              </Text>
            </View>
            <Text style={{ fontSize: 9, color: i === current ? T.teal : T.t3, fontWeight: i === current ? "600" : "400", textAlign: "center", width: 44 }}>
              {lbl}
            </Text>
          </View>
          {i < steps.length - 1 && (
            <View style={{ flex: 1, height: 1.5, backgroundColor: i < current ? T.teal : T.b2, marginHorizontal: 3, marginBottom: 18 }} />
          )}
        </View>
      ))}
    </View>
  );
}

export function CareTab() {
  const [modal, setModal] = useState(null);
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 14, paddingHorizontal: 14, paddingBottom: 90 }}>
      <Text style={{ fontSize: 10, fontWeight: "700", color: T.t3, letterSpacing: 1.1, textTransform: "uppercase", marginBottom: 10 }}>빠른 호출</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        {CARE_BTNS.map(btn => (
          <TouchableOpacity key={btn.label} onPress={() => setModal(btn.label)} style={{
            width: '48%', backgroundColor: T.bg2, borderColor: `${btn.color}22`, borderWidth: 1, borderRadius: T.r.lg,
            paddingVertical: 18, paddingHorizontal: 14, alignItems: "center", gap: 10
          }}>
            <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: `${btn.color}18`, borderColor: `${btn.color}33`, borderWidth: 1, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 22 }}>{btn.icon}</Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: "600", textAlign: "center", color: T.t1 }}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Card>
        <SectionLabel>출동 현황</SectionLabel>
        <StepBar current={1} />
        <View style={{ backgroundColor: T.bg3, borderRadius: T.r.sm, paddingVertical: 10, paddingHorizontal: 14, borderColor: T.b1, borderWidth: 1 }}>
          <Text style={{ fontSize: 12, color: T.t3 }}>약국 심부름 · 요양보호사 매칭 중...</Text>
        </View>
      </Card>

      <Card>
        <SectionLabel>지난 방문 결과</SectionLabel>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
          {[["💊", "혈압약 전달 완료", T.teal], ["💡", "형광등 교체 완료", T.amber]].map(([icon, cap, c]) => (
            <View key={cap} style={{ flex: 1, backgroundColor: T.bg3, borderRadius: T.r.md, paddingVertical: 14, paddingHorizontal: 10, alignItems: "center", borderColor: `${c}22`, borderWidth: 1 }}>
              <Text style={{ fontSize: 28, marginBottom: 7 }}>{icon}</Text>
              <Text style={{ fontSize: 11, color: T.t2, fontWeight: "500" }}>{cap}</Text>
            </View>
          ))}
        </View>
        <Text style={{ fontSize: 12, color: T.t3, lineHeight: 18 }}>어머니께서 컨디션이 좋으셨습니다. 약 정리도 함께 도와드렸습니다.</Text>
      </Card>

      <Modal visible={!!modal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,.6)", alignItems: "center", justifyContent: "center" }}>
          <View style={{ backgroundColor: T.bg2, borderRadius: T.r.xl, paddingVertical: 28, paddingHorizontal: 24, width: 320, alignItems: "center", borderColor: T.b2, borderWidth: 1 }}>
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: T.tealDim, borderColor: T.teal, borderWidth: 2, alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <Text style={{ fontSize: 22, color: T.teal }}>✓</Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: "700", color: T.t1, marginBottom: 8 }}>{modal} 요청 완료</Text>
            <Text style={{ fontSize: 13, color: T.t3, marginBottom: 20, lineHeight: 20, textAlign: "center" }}>요양보호사 매칭을 시작합니다.{"\n"}잠시 후 연락이 드려집니다.</Text>
            <Button onPress={() => setModal(null)} style={{ width: "100%" }}>확인</Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ── ProfileTab ────────────────────────────────────────────────────
function SettingRow({ icon, label, value, danger, onClick, right }) {
  return (
    <TouchableOpacity onPress={onClick} activeOpacity={onClick ? 0.7 : 1} style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, borderBottomColor: T.b1, borderBottomWidth: 1 }}>
      <View style={{ width: 36, height: 36, borderRadius: T.r.sm, backgroundColor: danger ? T.redDim : T.bg3, borderColor: danger ? "rgba(248,113,113,.2)" : T.b1, borderWidth: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "500", color: danger ? T.red : T.t1 }}>{label}</Text>
        {value ? <Text style={{ fontSize: 12, color: T.t3, marginTop: 1 }}>{value}</Text> : null}
      </View>
      {right ? right : (onClick && !right ? <Text style={{ color: T.t3, fontSize: 16 }}>›</Text> : null)}
    </TouchableOpacity>
  );
}

export function ProfileTab() {
  const { state } = useApp();
  const { signOut } = useAuth();
  const [notifs, setNotifs] = useState({ emergency: true, med: true, report: false });
  const [editOpen, setEdit] = useState(false);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 14, paddingHorizontal: 14, paddingBottom: 90 }}>
      {/* Hero */}
      <Card style={{ paddingVertical: 20, paddingHorizontal: 18, marginBottom: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{ width: 62, height: 62, borderRadius: 31, backgroundColor: T.tealDim, borderColor: `${T.teal}55`, borderWidth: 2, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 26 }}>👤</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: "700", color: T.t1 }}>{state.user?.name || "홍길동"}</Text>
            <Text style={{ fontSize: 12, color: T.t3, marginTop: 2 }}>{state.user?.email || "example@email.com"}</Text>
            <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: "600", backgroundColor: T.tealDim, color: T.teal, borderRadius: 99, paddingVertical: 2, paddingHorizontal: 10, overflow: "hidden" }}>보호자</Text>
              <Text style={{ fontSize: 11, fontWeight: "600", backgroundColor: T.bg3, color: T.t3, borderRadius: 99, paddingVertical: 2, paddingHorizontal: 10, borderColor: T.b2, borderWidth: 1, overflow: "hidden" }}>프리미엄</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setEdit(true)} style={{ backgroundColor: T.bg3, borderColor: T.b2, borderWidth: 1, borderRadius: T.r.sm, paddingVertical: 7, paddingHorizontal: 12 }}>
            <Text style={{ color: T.t2, fontSize: 12, fontWeight: "600" }}>수정</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Elder */}
      <Card>
        <SectionLabel>모니터링 중인 어르신</SectionLabel>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 13, paddingBottom: 14, borderBottomColor: T.b1, borderBottomWidth: 1 }}>
          <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: T.bg3, borderColor: T.b2, borderWidth: 2, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 22 }}>👩</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: T.t1 }}>{state.elder.name}</Text>
            <Text style={{ fontSize: 12, color: T.t3, marginTop: 2 }}>{state.elder.age}세 · {state.elder.address}</Text>
            <View style={{ flexDirection: "row", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
              {state.elder.conditions.map(c => (
                <Text key={c} style={{ fontSize: 10, backgroundColor: T.bg4, color: T.t3, borderRadius: 99, paddingVertical: 2, paddingHorizontal: 8, borderColor: T.b1, borderWidth: 1, overflow: "hidden" }}>{c}</Text>
              ))}
            </View>
          </View>
          <TouchableOpacity style={{ backgroundColor: T.bg3, borderColor: T.b2, borderWidth: 1, borderRadius: T.r.sm, paddingVertical: 7, paddingHorizontal: 12 }}>
            <Text style={{ color: T.t2, fontSize: 12, fontWeight: "600" }}>편집</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={{ width: "100%", marginTop: 12, paddingVertical: 10, borderRadius: T.r.sm, borderColor: T.b2, borderWidth: 1, borderStyle: "dashed", alignItems: "center" }}>
          <Text style={{ color: T.t3, fontSize: 13, fontWeight: "600" }}>+ 어르신 추가하기</Text>
        </TouchableOpacity>
      </Card>

      {/* Notifications */}
      <Card>
        <SectionLabel>알림 설정</SectionLabel>
        {[
          { key: "emergency", label: "응급 상황 알림", sub: "즉시 알림, 항상 켜기 권장" },
          { key: "med", label: "복약 알림", sub: "복용 시간 30분 전" },
          { key: "report", label: "주간 리포트 알림", sub: "매주 월요일 오전 9시" },
        ].map(item => (
          <View key={item.key} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderBottomColor: T.b1, borderBottomWidth: 1 }}>
            <View>
              <Text style={{ fontSize: 14, fontWeight: "500", color: T.t1 }}>{item.label}</Text>
              <Text style={{ fontSize: 11, color: T.t3, marginTop: 2 }}>{item.sub}</Text>
            </View>
            <Toggle on={notifs[item.key]} onChange={v => setNotifs(p => ({ ...p, [item.key]: v }))} />
          </View>
        ))}
      </Card>

      {/* App Settings */}
      <Card>
        <SectionLabel>앱 설정</SectionLabel>
        <SettingRow icon="🔗" label="기기 연결 관리" value="웨어러블 · 홈캠 2대" onClick={() => {}} />
        <SettingRow icon="🔒" label="개인정보 보호" value="데이터 관리 및 동의" onClick={() => {}} />
        <SettingRow icon="💳" label="구독 플랜" value="프리미엄 · ₩79,000/월" onClick={() => {}} />
        <SettingRow icon="💬" label="고객센터 문의" onClick={() => {}} />
        <SettingRow icon="ℹ️" label="앱 버전" value="v2.0.0" />
      </Card>

      <Card>
        <SettingRow icon="🚪" label="로그아웃" danger onClick={signOut} />
        <View style={{ borderBottomWidth: 0 }}>
          <SettingRow icon="⚠️" label="계정 탈퇴" danger onClick={() => {}} />
        </View>
      </Card>

      <Modal visible={editOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,.65)", justifyContent: "flex-end" }}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setEdit(false)} />
          <View style={{ backgroundColor: T.bg2, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingVertical: 22, paddingHorizontal: 22, paddingBottom: 40, borderColor: T.b2, borderWidth: 1 }}>
            <View style={{ width: 36, height: 4, backgroundColor: T.b2, borderRadius: 99, alignSelf: "center", marginBottom: 20 }} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: T.t1, marginBottom: 18 }}>프로필 수정</Text>
            {["이름", "이메일", "휴대폰"].map(f => (
              <View key={f} style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 11, fontWeight: "600", color: T.t3, marginBottom: 6 }}>{f}</Text>
                <TextInput 
                  style={{ backgroundColor: T.bg3, borderColor: T.b2, borderWidth: 1, borderRadius: T.r.sm, paddingVertical: 12, paddingHorizontal: 14, fontSize: 14, color: T.t1 }}
                  placeholder={f === "이름" ? "홍길동" : f === "이메일" ? "example@email.com" : "010-0000-0000"}
                  placeholderTextColor={T.t3}
                />
              </View>
            ))}
            <Button onPress={() => setEdit(false)} style={{ marginTop: 8 }}>저장하기</Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
