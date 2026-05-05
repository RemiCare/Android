import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import { T } from "../tokens";
import { Input, Button } from "../components/UI";
import { useAuth } from "../hooks/useAuth";

const STEPS = ["계정 정보", "보호자 정보", "어르신 등록", "완료"];
const RELATIONS = ["아들", "딸", "배우자", "손자/손녀", "형제/자매", "기타"];
const CONDITIONS = ["고혈압", "당뇨", "심장 질환", "치매", "관절염", "뇌졸중", "골다공증", "파킨슨"];

function ChipSelect({ options, selected, onToggle }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map(o => {
        const on = selected.includes(o);
        return (
          <TouchableOpacity 
            key={o} 
            onPress={() => onToggle(o)} 
            style={{
              paddingVertical: 7, paddingHorizontal: 14, borderRadius: T.r.full,
              backgroundColor: on ? T.tealDim : T.bg3,
              borderColor: on ? T.teal : T.b2, borderWidth: 1,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "600", color: on ? T.teal : T.t2 }}>
              {on ? "✓ " : ""}{o}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function SignupScreen({ onDone, onBack }) {
  const { signUp, loading } = useAuth();
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    phone: "", relation: "",
    elderName: "", elderAge: "", elderAddr: "", conditions: [],
  });

  const set = (key) => (text) => setForm(f => ({ ...f, [key]: text }));
  const toggleCondition = (c) => setForm(f => ({
    ...f, conditions: f.conditions.includes(c) ? f.conditions.filter(x => x !== c) : [...f.conditions, c]
  }));

  const canNext = [
    form.name && form.email && form.password,
    form.phone && form.relation,
    form.elderName && form.elderAddr,
  ][step] || step === 3;

  const goNext = async () => {
    if (step < 2) { setStep(s => s + 1); return; }
    const ok = await signUp(form);
    if (ok) setStep(3);
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
          {step === 0 && (
            <View>
              <Text style={styles.title}>안녕하세요!</Text>
              <Text style={styles.desc}>계정을 만들어 부모님을 지켜드리세요.</Text>
              <Input label="이름" placeholder="홍길동" value={form.name} onChangeText={set("name")} />
              <Input label="이메일" placeholder="example@email.com" value={form.email} onChangeText={set("email")} />
              <Input label="비밀번호" secureTextEntry placeholder="8자 이상" value={form.password} onChangeText={set("password")} hint="영문, 숫자, 특수문자 포함 8자 이상" />
            </View>
          )}

          {step === 1 && (
            <View>
              <Text style={styles.title}>보호자 정보</Text>
              <Text style={styles.desc}>긴급 상황 시 연락할 정보를 입력해주세요.</Text>
              <Input label="휴대폰 번호" placeholder="010-0000-0000" value={form.phone} onChangeText={set("phone")} />
              <View style={{ marginBottom: 14 }}>
                <Text style={styles.label}>어르신과의 관계</Text>
                <ChipSelect options={RELATIONS} selected={form.relation ? [form.relation] : []} onToggle={(r) => setForm(f => ({ ...f, relation: r }))} />
              </View>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={styles.title}>어르신 등록</Text>
              <Text style={styles.desc}>모니터링할 어르신의 정보를 입력해주세요.</Text>
              <View style={{ alignItems: "center", marginBottom: 22 }}>
                <TouchableOpacity style={styles.photoAdd}>
                  <Text style={{ fontSize: 26 }}>👤</Text>
                  <Text style={{ fontSize: 10, color: T.t3, marginTop: 4 }}>사진 추가</Text>
                </TouchableOpacity>
              </View>
              <Input label="어르신 성함" placeholder="김순자" value={form.elderName} onChangeText={set("elderName")} />
              <Input label="나이" placeholder="78" value={form.elderAge} onChangeText={set("elderAge")} />
              <Input label="거주지 주소" placeholder="서울시 마포구..." value={form.elderAddr} onChangeText={set("elderAddr")} />
              <View style={{ marginBottom: 14 }}>
                <Text style={styles.label}>기저 질환</Text>
                <ChipSelect options={CONDITIONS} selected={form.conditions} onToggle={toggleCondition} />
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <View style={styles.successIcon}>
                <Text style={{ fontSize: 44, color: T.teal }}>✓</Text>
              </View>
              <Text style={styles.successTitle}>가입 완료!</Text>
              <Text style={styles.successDesc}>
                {form.elderName || "어르신"} 님의 모니터링이{"\n"}시작되었습니다.
              </Text>
              <View style={styles.summaryCard}>
                {[["보호자", form.name || "홍길동"], ["연락처", form.phone || "-"], ["어르신", form.elderName || "김순자"], ["관계", form.relation || "-"]].map(([k, v]) => (
                  <View key={k} style={styles.summaryRow}>
                    <Text style={{ color: T.t3, fontSize: 13 }}>{k}</Text>
                    <Text style={{ color: T.t1, fontWeight: "600", fontSize: 13 }}>{v}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {step < 3 ? (
            <Button onPress={goNext} loading={loading} disabled={!canNext}>
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
  container: {
    flex: 1,
    backgroundColor: T.bg0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: T.r.md,
    backgroundColor: T.bg3,
    borderColor: T.b2,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    fontSize: 11,
    color: T.t3,
    marginBottom: 3,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: T.t1,
  },
  progressBg: {
    height: 3,
    backgroundColor: T.b1,
    marginHorizontal: 20,
    marginBottom: 28,
    borderRadius: 1.5,
  },
  progressFill: {
    height: "100%",
    backgroundColor: T.teal,
    borderRadius: 1.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: T.t1,
    marginBottom: 6,
  },
  desc: {
    fontSize: 14,
    color: T.t3,
    marginBottom: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: T.t3,
    marginBottom: 10,
    letterSpacing: 0.4,
  },
  photoAdd: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: T.bg3,
    borderColor: T.b2,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: T.tealDim,
    borderColor: T.teal,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: T.t1,
    marginBottom: 10,
  },
  successDesc: {
    fontSize: 14,
    color: T.t3,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 36,
  },
  summaryCard: {
    width: "100%",
    backgroundColor: T.bg2,
    borderRadius: T.r.lg,
    borderColor: T.b1,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    borderBottomColor: T.b1,
    borderBottomWidth: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 40,
  }
});
