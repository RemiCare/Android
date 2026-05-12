import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { T } from "../tokens";
import { Input, Button } from "../components/UI";
import { BASE_URL } from "../constants";

const TABS = ["아이디 찾기", "비밀번호 찾기"];

export default function FindAccountScreen({ onBack }) {
  const [tab,     setTab]     = useState(0);
  const [loading, setLoading] = useState(false);

  // 아이디 찾기
  const [findIdName,  setFindIdName]  = useState("");
  const [findIdPhone, setFindIdPhone] = useState("");
  const [foundId,     setFoundId]     = useState("");

  // 비밀번호 찾기
  const [loginId,     setLoginId]     = useState("");
  const [phone,       setPhone]       = useState("");
  const [smsSent,     setSmsSent]     = useState(false);
  const [smsCode,     setSmsCode]     = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetDone,   setResetDone]   = useState(false);

  const handleFindId = async () => {
    if (!findIdName || !findIdPhone) {
      Alert.alert("알림", "이름과 전화번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/find-id`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: findIdName, phoneNumber: findIdPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.status?.message || "아이디를 찾을 수 없습니다.");
      const id = data.results?.[0]?.loginId || "";
      if (!id) throw new Error("일치하는 계정이 없습니다.");
      setFoundId(id);
    } catch (e) {
      Alert.alert("오류", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetSms = async () => {
    if (!loginId || !phone) {
      Alert.alert("알림", "아이디와 전화번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/find-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, phoneNumber: phone }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.status?.message || "인증번호 발송에 실패했습니다.");
      }
      setSmsSent(true);
    } catch (e) {
      Alert.alert("오류", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!smsCode || !newPassword) {
      Alert.alert("알림", "인증번호와 새 비밀번호를 입력해주세요.");
      return;
    }
    if (newPassword.length < 10 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      Alert.alert("알림", "비밀번호는 영문+숫자 10자 이상이어야 합니다. (예: Abc12345678)");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, phoneNumber: phone, verificationCode: smsCode, newPassword }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.status?.message || "비밀번호 재설정에 실패했습니다.");
      }
      setResetDone(true);
    } catch (e) {
      Alert.alert("오류", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={{ color: T.t2, fontSize: 24, lineHeight: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>아이디 / 비밀번호 찾기</Text>
      </View>

      <View style={styles.tabRow}>
        {TABS.map((t, i) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(i)}
            style={[styles.tabBtn, tab === i && styles.tabBtnActive]}
          >
            <Text style={[styles.tabBtnText, tab === i && styles.tabBtnTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── 아이디 찾기 ── */}
        {tab === 0 && (
          <View>
            {foundId ? (
              <View style={styles.resultCard}>
                <Text style={{ fontSize: 13, color: T.t3, marginBottom: 8, textAlign: "center" }}>찾은 아이디</Text>
                <Text style={{ fontSize: 22, fontWeight: "800", color: T.teal, letterSpacing: 1, textAlign: "center" }}>{foundId}</Text>
                <Button onPress={onBack} style={{ marginTop: 24 }}>로그인 화면으로</Button>
              </View>
            ) : (
              <>
                <Text style={styles.desc}>가입 시 등록한 이름과 전화번호를 입력하세요.</Text>
                <Input label="이름" placeholder="홍길동" value={findIdName} onChangeText={setFindIdName} />
                <Input label="전화번호" placeholder="010-0000-0000" value={findIdPhone} onChangeText={setFindIdPhone} keyboardType="phone-pad" />
                <Button onPress={handleFindId} loading={loading} disabled={!findIdName || !findIdPhone}>
                  아이디 찾기
                </Button>
              </>
            )}
          </View>
        )}

        {/* ── 비밀번호 찾기 ── */}
        {tab === 1 && (
          <View>
            {resetDone ? (
              <View style={styles.resultCard}>
                <Text style={{ fontSize: 36, color: T.teal, textAlign: "center", marginBottom: 12 }}>✓</Text>
                <Text style={{ fontSize: 15, fontWeight: "700", color: T.t1, textAlign: "center", marginBottom: 8 }}>
                  비밀번호 재설정 완료
                </Text>
                <Text style={{ fontSize: 13, color: T.t3, textAlign: "center", lineHeight: 20, marginBottom: 24 }}>
                  새 비밀번호로 로그인하세요.
                </Text>
                <Button onPress={onBack}>로그인 화면으로</Button>
              </View>
            ) : (
              <>
                <Text style={styles.desc}>아이디와 가입 시 등록한 전화번호를 입력하세요.</Text>
                <Input label="아이디" placeholder="로그인 아이디" value={loginId} onChangeText={setLoginId} autoCapitalize="none" />

                <Text style={styles.label}>전화번호</Text>
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Input placeholder="010-0000-0000" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                  </View>
                  <TouchableOpacity onPress={handleSendResetSms} disabled={loading} style={styles.smsBtn}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: T.teal }}>
                      {smsSent ? "재발송" : "인증번호 발송"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {smsSent && (
                  <>
                    <Input label="인증번호" placeholder="4자리 입력" value={smsCode} onChangeText={setSmsCode} keyboardType="number-pad" maxLength={4} />
                    <Input label="새 비밀번호" placeholder="영문+숫자 10자 이상" secureTextEntry value={newPassword} onChangeText={setNewPassword} hint="예: Abc12345678" />
                    <Button onPress={handleResetPassword} loading={loading} disabled={!smsCode || !newPassword}>
                      비밀번호 재설정
                    </Button>
                  </>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: T.bg0 },
  header:         { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  backButton:     { width: 38, height: 38, borderRadius: T.r.md, backgroundColor: T.bg3, borderColor: T.b2, borderWidth: 1, alignItems: "center", justifyContent: "center", marginRight: 12 },
  headerTitle:    { fontSize: 18, fontWeight: "700", color: T.t1 },
  tabRow:         { flexDirection: "row", borderBottomColor: T.b1, borderBottomWidth: 1, marginHorizontal: 24, marginBottom: 28 },
  tabBtn:         { flex: 1, paddingVertical: 10, alignItems: "center", borderBottomColor: "transparent", borderBottomWidth: 2 },
  tabBtnActive:   { borderBottomColor: T.teal },
  tabBtnText:     { fontSize: 14, fontWeight: "600", color: T.t3 },
  tabBtnTextActive:{ color: T.teal },
  content:        { flex: 1, paddingHorizontal: 24 },
  desc:           { fontSize: 14, color: T.t3, marginBottom: 24, lineHeight: 22 },
  label:          { fontSize: 13, fontWeight: "600", color: T.t3, marginBottom: 10, letterSpacing: 0.4 },
  resultCard:     { backgroundColor: T.bg2, borderRadius: T.r.lg, borderColor: T.b1, borderWidth: 1, padding: 28, alignItems: "center", marginTop: 20 },
  smsBtn:         { paddingHorizontal: 12, paddingVertical: 12, borderRadius: T.r.sm, backgroundColor: T.tealDim, borderColor: T.teal, borderWidth: 1, justifyContent: "center", alignSelf: "flex-start" },
});
