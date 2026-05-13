import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { T } from "../tokens";
import { Input, Button } from "../components/UI";
import { useAuth } from "../hooks/useAuth";

const STEPS = ["보호자 계정", "연락처 인증", "어르신 정보", "완료"];
const GENDERS = ["남", "여"];

function GenderSelect({ value, onChange }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
      {GENDERS.map(g => {
        const on = value === g;
        return (
          <TouchableOpacity key={g} onPress={() => onChange(g)} style={{
            flex: 1, paddingVertical: 10, borderRadius: T.r.sm, alignItems: "center",
            backgroundColor: on ? T.tealDim : T.bg3,
            borderColor: on ? T.teal : T.b2, borderWidth: 1,
          }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: on ? T.teal : T.t2 }}>{g}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function SectionDivider({ label }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 18 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: T.b1 }} />
      <Text style={{ fontSize: 11, color: T.t3, marginHorizontal: 10, fontWeight: "600" }}>{label}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: T.b1 }} />
    </View>
  );
}

export default function SignupScreen({ onDone, onBack }) {
  const { signUp, sendSmsCode, verifySmsCode, checkLoginId, loading, error } = useAuth();
  const [step, setStep] = useState(0);
  const [idCheckStatus, setIdCheckStatus] = useState(null); // null | "checking" | "ok" | "taken" | "error"
  const [elderlyLoginCode, setElderlyLoginCode] = useState("");

  const [form, setForm] = useState({
    loginId: "", name: "", password: "", gender: "남",
    phone: "", address: "",
    elderName: "", elderPhone: "", elderAddr: "", elderGender: "남",
  });

  // SMS 인증
  const [smsCode, setSmsCode] = useState("");
  const [smsSent, setSmsSent] = useState(false);
  const [smsVerified, setSmsVerified] = useState(false);
  const [timer, setTimer] = useState(300);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!timerActive) return;
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); setTimerActive(false); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  const timerLabel = `${String(Math.floor(timer / 60)).padStart(2, "0")}:${String(timer % 60).padStart(2, "0")}`;

  const set = (key) => (text) => setForm(f => ({ ...f, [key]: text }));

  const handleCheckId = async () => {
    if (!form.loginId) return;
    setIdCheckStatus("checking");
    const result = await checkLoginId(form.loginId);
    setIdCheckStatus(result);
  };

  const handleSendSms = async () => {
    if (!form.phone) { Alert.alert("알림", "휴대폰 번호를 입력해주세요."); return; }
    const ok = await sendSmsCode(form.phone);
    if (ok) {
      setSmsSent(true);
      setTimer(300);
      setTimerActive(true);
      setSmsVerified(false);
      setSmsCode("");
    } else {
      Alert.alert("오류", "인증번호 발송에 실패했습니다. 번호를 확인해주세요.");
    }
  };

  const handleVerifySms = async () => {
    if (!smsCode) { Alert.alert("알림", "인증번호를 입력해주세요."); return; }
    const ok = await verifySmsCode(form.phone, smsCode);
    if (ok) {
      setSmsVerified(true);
      setTimerActive(false);
      clearInterval(timerRef.current);
    } else {
      Alert.alert("오류", "인증번호가 올바르지 않습니다.");
    }
  };

  const canNext = [
    form.loginId && form.name && form.password && form.password.length >= 8
      && idCheckStatus !== null && idCheckStatus !== "taken" && idCheckStatus !== "checking",
    smsVerified && form.address,
    form.elderName && form.elderAddr,
  ][step] ?? true;

  const goNext = async () => {
    if (step < 2) { setStep(s => s + 1); return; }
    const result = await signUp(form);
    if (result.ok) {
      setElderlyLoginCode(result.elderlyLoginCode || "");
      setStep(3);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.header}>
          {step < 3 && (
            <TouchableOpacity onPress={step === 0 ? onBack : () => setStep(s => s - 1)} style={styles.backButton}>
              <Text style={{ color: T.t2, fontSize: 24, lineHeight: 24 }}>‹</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1, marginLeft: step < 3 ? 12 : 0 }}>
            <Text style={styles.stepText}>{step < 3 ? `단계 ${step + 1} / 3` : "완료"}</Text>
            <Text style={styles.stepTitle}>{STEPS[step]}</Text>
          </View>
        </View>

        {step < 3 && (
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${(step + 1) / 3 * 100}%` }]} />
          </View>
        )}

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>

          {/* ── Step 0: 보호자 계정 ── */}
          {step === 0 && (
            <View>
              <Text style={styles.title}>보호자 계정 만들기</Text>
              <Text style={styles.desc}>로그인에 사용할 아이디와 비밀번호를 설정하세요.</Text>
              <Text style={styles.label}>아이디</Text>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}>
                <View style={{ flex: 1 }}>
                  <Input
                    placeholder="영문/숫자 조합"
                    value={form.loginId}
                    onChangeText={v => { set("loginId")(v); setIdCheckStatus(null); }}
                    autoCapitalize="none"
                  />
                </View>
                <TouchableOpacity
                  onPress={handleCheckId}
                  disabled={!form.loginId || idCheckStatus === "checking"}
                  style={[styles.smsBtn, idCheckStatus === "ok" && { borderColor: T.green }]}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600", color: idCheckStatus === "ok" ? T.green : T.teal }}>
                    {idCheckStatus === "checking" ? "확인 중..." : idCheckStatus === "ok" ? "✓ 사용 가능" : "중복 확인"}
                  </Text>
                </TouchableOpacity>
              </View>
              {idCheckStatus === "taken" && (
                <Text style={{ fontSize: 12, color: T.red, marginBottom: 10 }}>이미 사용 중인 아이디입니다.</Text>
              )}
              {idCheckStatus === "error" && (
                <Text style={{ fontSize: 12, color: T.amber, marginBottom: 10 }}>서버 확인 불가 — 가입 시 자동 확인됩니다.</Text>
              )}
              <Input label="이름" placeholder="홍길동" value={form.name} onChangeText={set("name")} />
              <Input label="비밀번호" secureTextEntry placeholder="영문+숫자 10자 이상" value={form.password} onChangeText={set("password")} hint="예: Abc12345678" />
              <Text style={styles.label}>성별</Text>
              <GenderSelect value={form.gender} onChange={v => setForm(f => ({ ...f, gender: v }))} />
            </View>
          )}

          {/* ── Step 1: 연락처 + SMS 인증 ── */}
          {step === 1 && (
            <View>
              <Text style={styles.title}>연락처 인증</Text>
              <Text style={styles.desc}>휴대폰 번호를 인증해주세요.</Text>

              <Text style={styles.label}>휴대폰 번호</Text>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
                <View style={{ flex: 1 }}>
                  <Input
                    placeholder="010-0000-0000"
                    value={form.phone}
                    onChangeText={set("phone")}
                    keyboardType="phone-pad"
                  />
                </View>
                <TouchableOpacity onPress={handleSendSms} style={styles.smsBtn}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: T.teal }}>
                    {smsSent ? "재발송" : "인증번호 발송"}
                  </Text>
                </TouchableOpacity>
              </View>

              {smsSent && (
                <View style={{ marginBottom: 14 }}>
                  <Text style={styles.label}>인증번호</Text>
                  <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                    <View style={{ flex: 1 }}>
                      <Input
                        placeholder="4자리 입력"
                        value={smsCode}
                        onChangeText={setSmsCode}
                        keyboardType="number-pad"
                        maxLength={4}
                      />
                    </View>
                    <TouchableOpacity onPress={handleVerifySms} style={[styles.smsBtn, smsVerified && { borderColor: T.green }]}>
                      <Text style={{ fontSize: 12, fontWeight: "600", color: smsVerified ? T.green : T.teal }}>
                        {smsVerified ? "✓ 확인됨" : "확인"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {!smsVerified && (
                    <Text style={{ fontSize: 12, color: timer > 0 ? T.amber : T.red, marginTop: 4 }}>
                      {timer > 0 ? `유효시간 ${timerLabel}` : "인증 시간이 만료됐습니다. 재발송해주세요."}
                    </Text>
                  )}
                </View>
              )}

              <Input label="주소" placeholder="서울시 마포구..." value={form.address} onChangeText={set("address")} />
            </View>
          )}

          {/* ── Step 2: 어르신 정보 ── */}
          {step === 2 && (
            <View>
              <Text style={styles.title}>어르신 등록</Text>
              <Text style={styles.desc}>모니터링할 어르신의 정보를 입력해주세요.</Text>

              <SectionDivider label="어르신 정보" />
              <Input label="어르신 성함" placeholder="김순자" value={form.elderName} onChangeText={set("elderName")} />
              <Input label="휴대폰 번호" placeholder="010-0000-0000" value={form.elderPhone} onChangeText={set("elderPhone")} keyboardType="phone-pad" />
              <Input label="거주지 주소" placeholder="서울시 마포구..." value={form.elderAddr} onChangeText={set("elderAddr")} />
              <Text style={styles.label}>성별</Text>
              <GenderSelect value={form.elderGender} onChange={v => setForm(f => ({ ...f, elderGender: v }))} />
            </View>
          )}

          {/* ── Step 3: 완료 ── */}
          {step === 3 && (
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <View style={styles.successIcon}>
                <Text style={{ fontSize: 44, color: T.teal }}>✓</Text>
              </View>
              <Text style={styles.successTitle}>가입 완료!</Text>
              <Text style={styles.successDesc}>
                {form.elderName || "어르신"} 님의 모니터링이{"\n"}시작되었습니다.
              </Text>

              {elderlyLoginCode ? (
                <View style={[styles.summaryCard, { marginBottom: 16 }]}>
                  <Text style={{ fontSize: 12, color: T.t3, marginBottom: 8, textAlign: "center" }}>
                    어르신 로그인 코드
                  </Text>
                  <Text style={{ fontSize: 20, fontWeight: "800", color: T.teal, textAlign: "center", letterSpacing: 2 }}>
                    {elderlyLoginCode}
                  </Text>
                  <Text style={{ fontSize: 11, color: T.t3, marginTop: 8, textAlign: "center", lineHeight: 16 }}>
                    이 코드를 어르신 기기에서 사용하세요.{"\n"}안전한 곳에 보관해주세요.
                  </Text>
                </View>
              ) : null}

              <View style={styles.summaryCard}>
                {[
                  ["보호자", form.name],
                  ["아이디", form.loginId],
                  ["연락처", form.phone],
                  ["어르신", form.elderName],
                ].map(([k, v]) => (
                  <View key={k} style={styles.summaryRow}>
                    <Text style={{ color: T.t3, fontSize: 13 }}>{k}</Text>
                    <Text style={{ color: T.t1, fontWeight: "600", fontSize: 13 }}>{v || "-"}</Text>
                  </View>
                ))}
              </View>

              {error ? <Text style={{ color: T.red, marginTop: 12, fontSize: 12 }}>{error}</Text> : null}
            </View>
          )}

          {error && step < 3 ? (
            <Text style={{ color: T.red, marginTop: 8, fontSize: 12 }}>{error}</Text>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          {step < 3 ? (
            <Button onPress={goNext} loading={loading} disabled={!canNext || loading}>
              {step === 2 ? "가입 완료" : "다음"}
            </Button>
          ) : (
            <Button onPress={onDone}>시작하기 →</Button>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: T.bg0 },
  header:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  backButton:   { width: 38, height: 38, borderRadius: T.r.md, backgroundColor: T.bg3, borderColor: T.b2, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  stepText:     { fontSize: 11, color: T.t3, marginBottom: 3 },
  stepTitle:    { fontSize: 18, fontWeight: "700", color: T.t1 },
  progressBg:   { height: 3, backgroundColor: T.b1, marginHorizontal: 20, marginBottom: 28, borderRadius: 1.5 },
  progressFill: { height: "100%", backgroundColor: T.teal, borderRadius: 1.5 },
  content:      { flex: 1, paddingHorizontal: 24 },
  title:        { fontSize: 22, fontWeight: "700", color: T.t1, marginBottom: 6 },
  desc:         { fontSize: 14, color: T.t3, marginBottom: 28 },
  label:        { fontSize: 13, fontWeight: "600", color: T.t3, marginBottom: 10, letterSpacing: 0.4 },
  smsBtn:       { paddingHorizontal: 12, paddingVertical: 12, borderRadius: T.r.sm, backgroundColor: T.tealDim, borderColor: T.teal, borderWidth: 1, justifyContent: "center", alignSelf: "flex-start" },
  successIcon:  { width: 96, height: 96, borderRadius: 48, backgroundColor: T.tealDim, borderColor: T.teal, borderWidth: 3, alignItems: "center", justifyContent: "center", marginBottom: 28 },
  successTitle: { fontSize: 26, fontWeight: "800", color: T.t1, marginBottom: 10 },
  successDesc:  { fontSize: 14, color: T.t3, lineHeight: 24, textAlign: "center", marginBottom: 28 },
  summaryCard:  { width: "100%", backgroundColor: T.bg2, borderRadius: T.r.lg, borderColor: T.b1, borderWidth: 1, paddingVertical: 18, paddingHorizontal: 20 },
  summaryRow:   { flexDirection: "row", justifyContent: "space-between", paddingVertical: 7, borderBottomColor: T.b1, borderBottomWidth: 1 },
  footer:       { paddingHorizontal: 24, paddingVertical: 16, paddingBottom: 40 },
});
