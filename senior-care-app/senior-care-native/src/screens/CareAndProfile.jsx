import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput } from "react-native";
import { T } from "../tokens";
import { Card, SectionLabel, Toggle, Button } from "../components/UI";
import { useApp } from "../context/AppContext";
import { useAuth } from "../hooks/useAuth";
import { BASE_URL } from "../constants";



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
  const { state, addElder, selectElder, removeElder } = useApp();
  const { signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [notifs, setNotifs] = useState({ emergency: true, med: true, report: false });
  const [editOpen, setEdit] = useState(false);

  useEffect(() => {
    if (!state.user?.token) return;
    fetch(`${BASE_URL}/api/user/me`, {
      headers: { Authorization: `Bearer ${state.user.token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.results?.[0]) setProfile(data.results[0]); })
      .catch(() => {});
  }, [state.user?.token]);

  const displayName    = profile?.name    || state.user?.name  || "홍길동";
  const displayEmail   = profile?.email   || state.user?.email || "example@email.com";
  const displayPhone   = profile?.phoneNumber || "-";
  const displayAddress = profile?.address || "-";
  const roleLabel = profile?.role === "ELDER" ? "어르신" : profile?.role === "PROTECTOR" ? "보호자" : state.user?.role === "elder" ? "어르신" : "보호자";
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newAddr, setNewAddr] = useState("");
  const [newConditions, setNewConditions] = useState([]);

  const CONDITION_OPTIONS = ["고혈압", "당뇨", "관절염", "치매", "심장질환", "뇌졸중", "골다공증", "만성폐질환"];

  function toggleCondition(cond) {
    setNewConditions(prev => prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]);
  }

  function handleAddElder() {
    if (!newName.trim()) return;
    addElder({ name: newName.trim(), age: parseInt(newAge) || 0, address: newAddr.trim(), conditions: newConditions, photo: null });
    setNewName(""); setNewAge(""); setNewAddr(""); setNewConditions([]);
    setAddOpen(false);
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 14, paddingHorizontal: 14, paddingBottom: 90 }}>
      {/* Hero */}
      <Card style={{ paddingVertical: 20, paddingHorizontal: 18, marginBottom: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{ width: 62, height: 62, borderRadius: 31, backgroundColor: T.tealDim, borderColor: `${T.teal}55`, borderWidth: 2, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 26 }}>👤</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: "700", color: T.t1 }}>{displayName}</Text>
            <Text style={{ fontSize: 12, color: T.t3, marginTop: 2 }}>{displayEmail}</Text>
            <Text style={{ fontSize: 12, color: T.t3, marginTop: 1 }}>{displayPhone}  ·  {displayAddress}</Text>
            <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: "600", backgroundColor: T.tealDim, color: T.teal, borderRadius: 99, paddingVertical: 2, paddingHorizontal: 10, overflow: "hidden" }}>{roleLabel}</Text>
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
        {(state.elders || [state.elder]).map((e, idx) => {
          const isSelected = e.id === state.selectedElderId;
          return (
            <View key={e.id} style={{ flexDirection: "row", alignItems: "center", gap: 13, paddingVertical: 12, borderBottomColor: T.b1, borderBottomWidth: 1 }}>
              <TouchableOpacity onPress={() => selectElder(e.id)} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: isSelected ? T.tealDim : T.bg3, borderColor: isSelected ? T.teal : T.b2, borderWidth: 2, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 22 }}>👩</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => selectElder(e.id)} style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: isSelected ? T.teal : T.t1 }}>{e.name}</Text>
                  {isSelected && <Text style={{ fontSize: 10, fontWeight: "700", backgroundColor: T.tealDim, color: T.teal, borderRadius: 99, paddingVertical: 2, paddingHorizontal: 8, overflow: "hidden" }}>모니터링 중</Text>}
                </View>
                <Text style={{ fontSize: 12, color: T.t3, marginTop: 2 }}>{e.age}세 · {e.address}</Text>
                {e.loginCode ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                    <Text style={{ fontSize: 11, color: T.t3 }}>로그인 코드</Text>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: T.teal, backgroundColor: T.tealDim, borderRadius: 6, paddingVertical: 1, paddingHorizontal: 7, overflow: "hidden" }}>{e.loginCode}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
              {(state.elders || []).length > 1 && (
                <TouchableOpacity onPress={() => removeElder(e.id)} style={{ padding: 8 }}>
                  <Text style={{ color: T.red, fontSize: 18 }}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
        <TouchableOpacity onPress={() => setAddOpen(true)} style={{ width: "100%", marginTop: 12, paddingVertical: 10, borderRadius: T.r.sm, borderColor: T.teal, borderWidth: 1, borderStyle: "dashed", alignItems: "center" }}>
          <Text style={{ color: T.teal, fontSize: 13, fontWeight: "600" }}>+ 어르신 추가하기</Text>
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

      <Modal visible={addOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,.65)", justifyContent: "flex-end" }}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setAddOpen(false)} />
          <View style={{ backgroundColor: T.bg2, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingVertical: 22, paddingHorizontal: 22, paddingBottom: 40, borderColor: T.b2, borderWidth: 1 }}>
            <View style={{ width: 36, height: 4, backgroundColor: T.b2, borderRadius: 99, alignSelf: "center", marginBottom: 20 }} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: T.t1, marginBottom: 18 }}>어르신 추가</Text>
            {[
              { label: "이름", value: newName, setter: setNewName, placeholder: "예) 김순자" },
              { label: "나이", value: newAge, setter: setNewAge, placeholder: "예) 78", keyboardType: "numeric" },
              { label: "주소", value: newAddr, setter: setNewAddr, placeholder: "예) 서울 마포구" },
            ].map(f => (
              <View key={f.label} style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 11, fontWeight: "600", color: T.t3, marginBottom: 6 }}>{f.label}</Text>
                <TextInput
                  style={{ backgroundColor: T.bg3, borderColor: T.b2, borderWidth: 1, borderRadius: T.r.sm, paddingVertical: 12, paddingHorizontal: 14, fontSize: 14, color: T.t1 }}
                  placeholder={f.placeholder}
                  placeholderTextColor={T.t3}
                  value={f.value}
                  onChangeText={f.setter}
                  keyboardType={f.keyboardType || "default"}
                />
              </View>
            ))}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 11, fontWeight: "600", color: T.t3, marginBottom: 8 }}>질환 선택 (복수 선택 가능)</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {CONDITION_OPTIONS.map(cond => {
                  const active = newConditions.includes(cond);
                  return (
                    <TouchableOpacity
                      key={cond}
                      onPress={() => toggleCondition(cond)}
                      style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 99, backgroundColor: active ? T.tealDim : T.bg3, borderColor: active ? T.teal : T.b2, borderWidth: 1 }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: active ? "700" : "400", color: active ? T.teal : T.t3 }}>{cond}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <Button onPress={handleAddElder} style={{ marginTop: 8 }}>추가하기</Button>
          </View>
        </View>
      </Modal>

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
