import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, SafeAreaView } from "react-native";
import { T } from "../tokens";
import { Card, SectionLabel, Pill, ProgressRing, Divider, EmptyState } from "../components/UI";
import { useVitals } from "../hooks/useVitals";
import { useMedication } from "../hooks/useMedication";
import { useApp } from "../context/AppContext";

// ── Vitals Card ───────────────────────────────────────────────────
function VitalsCard() {
  const { vitals, statusColor } = useVitals();

  return (
    <Card style={{ padding: 0, overflow: "hidden", marginBottom: 12 }}>
      {/* Status bar */}
      <View style={{ height: 3, backgroundColor: statusColor }} />
      <View style={{ paddingVertical: 14, paddingHorizontal: 16 }}>
        <SectionLabel>
          실시간 바이탈
        </SectionLabel>

        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
          {[
            { val: vitals.heartRate, unit: "bpm", label: "심박수", color: T.green, icon: "♥" },
            { val: vitals.steps || "5,432", unit: "걸음", label: "걸음수", color: T.blue, icon: "👣" },
            { val: vitals.oxygen, unit: "%", label: "혈중산소", color: T.teal, icon: "◎" },
          ].map(v => (
            <View key={v.label} style={{ flex: 1, backgroundColor: T.bg3, borderRadius: T.r.md, paddingVertical: 11, paddingHorizontal: 10 }}>
              <Text style={{ fontSize: 10, color: v.color, fontWeight: "700", marginBottom: 4, opacity: 0.8 }}>{v.icon} {v.label}</Text>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 2 }}>
                <Text style={{ fontSize: 17, fontWeight: "700", color: v.color }}>{v.val}</Text>
                <Text style={{ fontSize: 9, color: T.t3 }}>{v.unit}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 10, color: T.t3, marginTop: 8, textAlign: "right" }}>
          마지막 업데이트: {vitals.lastUpdated.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </Text>
      </View>
    </Card>
  );
}

// ── Medication Card ───────────────────────────────────────────────
function MedicationCard() {
  const { meds, toggleTaken, stats, nextMed } = useMedication();
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <SectionLabel action={open ? "접기" : "상세보기"} onAction={() => setOpen(!open)}>
        복약 관리
      </SectionLabel>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <ProgressRing value={stats.taken} max={stats.total} size={56} stroke={5} color={stats.allDone ? T.green : T.teal} label={`/${stats.total}`} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: T.t1, marginBottom: 4 }}>
            오늘 {stats.taken}/{stats.total} 복용 완료
          </Text>
          <View style={{ height: 5, backgroundColor: T.bg4, borderRadius: 99 }}>
            <View style={{ width: `${stats.pct}%`, height: "100%", backgroundColor: stats.allDone ? T.green : T.teal, borderRadius: 99 }} />
          </View>
          <Text style={{ fontSize: 11, color: T.t3, marginTop: 4 }}>
            {stats.allDone ? "✓ 모든 약 복용 완료" : nextMed ? `다음: ${nextMed.time} ${nextMed.name.split(" ")[0]}` : "남은 약 없음"}
          </Text>
        </View>
      </View>

      {open && (
        <View style={{ marginTop: 12, gap: 8 }}>
          <Divider />
          {meds.map(med => (
            <View key={med.id} style={{ backgroundColor: T.bg3, borderRadius: T.r.md, paddingVertical: 11, paddingHorizontal: 13 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: med.color }} />
                <Text style={{ fontSize: 12, fontWeight: "600", color: T.t1 }}>{med.name}</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
                {med.times.map((t, ti) => (
                  <TouchableOpacity key={ti} onPress={() => toggleTaken(med.id, ti)} style={{
                    flexDirection: "row", alignItems: "center", gap: 5,
                    paddingVertical: 5, paddingHorizontal: 12, borderRadius: 99,
                    backgroundColor: med.taken[ti] ? `${med.color}22` : T.bg4,
                    borderColor: med.taken[ti] ? med.color : T.b2, borderWidth: 1,
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: "600", color: med.taken[ti] ? med.color : T.t3 }}>
                      {med.taken[ti] ? "✓" : "○"} {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
          <Text style={{ fontSize: 11, color: T.t3 }}>*  수동 보정</Text>
        </View>
      )}
    </Card>
  );
}

// ── HomeCam Card ──────────────────────────────────────────────────
function HomeCamCard() {
  const [cameras, setCameras] = useState(["거실"]);
  const [cam, setCam] = useState("거실");
  const [live, setLive] = useState(true);
  const [motion, setMotion] = useState(true);
  const [full, setFull] = useState(false);

  const handleAddCamera = () => {
    Alert.prompt(
      "카메라 추가",
      "추가할 홈캠의 위치를 입력하세요 (예: 안방, 마당):",
      [
        { text: "취소", style: "cancel" },
        { 
          text: "추가", 
          onPress: (newName) => {
            if (!newName || newName.trim() === "") return;
            if (cameras.includes(newName)) {
              Alert.alert("알림", "이미 추가된 위치입니다.");
              return;
            }
            setCameras(prev => [...prev, newName]);
            setCam(newName);
          }
        }
      ]
    );
  };

  const CamView = ({ height = 220 }) => (
    <View style={{ position: "relative", backgroundColor: "#060D1A", height }}>
      <View style={{ position: "absolute", bottom: 0, width: "100%", height: "40%", backgroundColor: "rgba(255,255,255,0.03)" }} />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {live ? (
          <Text style={{ color: "rgba(45,212,191,0.5)", fontSize: 18 }}>[카메라 피드 - {cam}]</Text>
        ) : (
          <Text style={{ color: T.t2, fontSize: 13 }}>연결 끊김</Text>
        )}
      </View>
      {live && (
        <View style={{ position: "absolute", top: 10, left: 10, flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#E24B4A" }} />
          <Text style={{ color: "rgba(255,255,255,0.9)", fontWeight: "bold", fontSize: 10 }}>REC</Text>
        </View>
      )}
    </View>
  );

  return (
    <>
      <Card style={{ padding: 0, overflow: "hidden", marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 13, paddingHorizontal: 16 }}>
          <SectionLabel>홈캠 라이브</SectionLabel>
          <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
            {motion && <Pill color={T.amber} dim={T.amberDim} border="rgba(251,191,36,.3)">움직임 감지</Pill>}
            <TouchableOpacity onPress={() => setFull(true)} style={{ backgroundColor: T.bg4, borderColor: T.b2, borderWidth: 1, borderRadius: T.r.sm, paddingVertical: 4, paddingHorizontal: 10 }}>
              <Text style={{ fontSize: 11, color: T.t2 }}>전체화면</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ borderTopColor: T.b1, borderTopWidth: 1, flexDirection: "row" }}>
          {cameras.map(loc => (
            <TouchableOpacity key={loc} onPress={() => setCam(loc)} style={{ paddingVertical: 9, paddingHorizontal: 12, borderBottomColor: cam === loc ? T.teal : "transparent", borderBottomWidth: 2 }}>
              <Text style={{ fontSize: 12, fontWeight: cam === loc ? "700" : "400", color: cam === loc ? T.teal : T.t3 }}>{loc}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={handleAddCamera} style={{ paddingVertical: 9, paddingHorizontal: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: T.blue }}>+ 추가</Text>
          </TouchableOpacity>
        </ScrollView>

        <CamView />

        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8, paddingVertical: 10, paddingHorizontal: 13 }}>
          {[
            { label: live ? "연결 중단" : "재연결", color: live ? T.red : T.green, dim: live ? T.redDim : T.greenDim, action: () => setLive(!live) },
            { label: `움직임 ${motion ? "ON" : "OFF"}`, color: motion ? T.amber : T.t3, dim: motion ? T.amberDim : T.bg4, action: () => setMotion(!motion) },
            { label: "스냅샷", color: T.teal, dim: T.tealDim, action: () => {} },
          ].map(b => (
            <TouchableOpacity key={b.label} onPress={b.action} style={{ flex: 1, paddingVertical: 8, borderRadius: T.r.sm, backgroundColor: b.dim, borderColor: `${b.color}33`, borderWidth: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 11, fontWeight: "600", color: b.color }}>{b.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Modal visible={full} animationType="slide" onRequestClose={() => setFull(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: T.bg0 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, paddingHorizontal: 20, borderBottomColor: T.b1, borderBottomWidth: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: T.t1 }}>RemiCare Cam — {cam}</Text>
            <TouchableOpacity onPress={() => setFull(false)} style={{ backgroundColor: T.bg4, borderColor: T.b2, borderWidth: 1, borderRadius: T.r.sm, paddingVertical: 6, paddingHorizontal: 14 }}>
              <Text style={{ color: T.t1, fontSize: 13 }}>닫기</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <CamView height={360} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ borderTopColor: T.b1, borderTopWidth: 1, paddingBottom: 24, flexDirection: "row", maxHeight: 60 }}>
            {cameras.map(loc => (
              <TouchableOpacity key={loc} onPress={() => setCam(loc)} style={{ paddingVertical: 12, paddingHorizontal: 16, borderTopColor: cam === loc ? T.teal : "transparent", borderTopWidth: 2 }}>
                <Text style={{ fontSize: 12, fontWeight: cam === loc ? "700" : "400", color: cam === loc ? T.teal : "rgba(255,255,255,.35)" }}>{loc}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={handleAddCamera} style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: T.blue }}>+ 추가</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

// ── Timeline ──────────────────────────────────────────────────────
function TimelineCard() {
  const [timeline, setTimeline] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const dotColor = { done: T.green, warn: T.amber, wait: T.t3 };
  const dayStr = ["일", "월", "화", "수", "목", "금", "토"][new Date().getDay()];

  useEffect(() => {
    const fetchTimeline = async () => {
      setIsLoading(true);
      try {
        await new Promise(res => setTimeout(res, 500));
        const initialData = [
          { id: 1, time: "08:00", label: "기상 및 아침 산책", status: "done", note: "완료" },
          { id: 2, time: "10:00", label: "복지관 문화교실", status: "wait", note: "예정" },
        ];
        setTimeline(initialData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimeline();
  }, []);

  const handleAdd = () => {
    const tempId = `temp_${Date.now()}`; 
    setTimeline([...timeline, { id: tempId, time: "12:00", label: "새 일정", status: "wait", note: "예정" }]);
  };

  const handleRemove = (id) => {
    Alert.alert("삭제", "이 일정을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "삭제", onPress: () => setTimeline(timeline.filter(item => item.id !== id)), style: "destructive" }
    ]);
  };

  const handleChange = (id, field, value) => {
    setTimeline(timeline.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(res => setTimeout(res, 500));
      setIsEditing(false);
    } catch (error) {
      Alert.alert("에러", "저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  const sortedTimeline = [...timeline].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <Card>
      <SectionLabel 
        action={isLoading ? "로딩중..." : (isEditing ? (isSaving ? "저장 중..." : "저장") : "수정")} 
        onAction={() => {
          if (isLoading || isSaving) return;
          if (isEditing) handleSave();
          else setIsEditing(true);
        }}
      >
        오늘의 일정 ({dayStr}요일)
      </SectionLabel>

      {isLoading ? (
        <View style={{ paddingVertical: 20, alignItems: "center" }}>
          <Text style={{ fontSize: 12, color: T.t3 }}>데이터를 불러오는 중입니다...</Text>
        </View>
      ) : isEditing ? (
        <View style={{ gap: 10, marginTop: 10 }}>
          {sortedTimeline.map((item) => (
            <View key={item.id} style={{ flexDirection: "row", gap: 8, alignItems: "center", backgroundColor: T.bg3, padding: 8, borderRadius: T.r.sm }}>
              <TextInput 
                value={item.time} 
                onChangeText={(text) => handleChange(item.id, "time", text)}
                style={{ backgroundColor: T.bg4, borderColor: T.b2, borderWidth: 1, color: T.t1, borderRadius: T.r.sm, padding: 4, width: 60, textAlign: "center" }}
              />
              <TextInput 
                value={item.label} 
                onChangeText={(text) => handleChange(item.id, "label", text)}
                style={{ flex: 1, backgroundColor: T.bg4, borderColor: T.b2, borderWidth: 1, color: T.t1, borderRadius: T.r.sm, paddingVertical: 4, paddingHorizontal: 8, fontSize: 13 }}
              />
              <TouchableOpacity onPress={() => handleRemove(item.id)} style={{ padding: 4 }}>
                <Text style={{ color: T.red, fontWeight: "700" }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={handleAdd} style={{ marginTop: 4, padding: 8, backgroundColor: T.bg4, borderColor: T.teal, borderWidth: 1, borderStyle: "dashed", borderRadius: T.r.sm, alignItems: "center" }}>
            <Text style={{ color: T.teal, fontSize: 12, fontWeight: "600" }}>+ 새 일정 추가</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ marginTop: 10 }}>
          {sortedTimeline.length === 0 ? (
            <EmptyState icon="🗓" title="일정 없음" desc="우측 상단의 수정을 눌러 일정을 추가하세요." />
          ) : (
            sortedTimeline.map((item, i) => (
              <View key={item.id} style={{ flexDirection: "row", gap: 12, paddingBottom: i < sortedTimeline.length - 1 ? 13 : 0 }}>
                <View style={{ alignItems: "center", width: 38 }}>
                  <Text style={{ fontSize: 10, color: T.t3 }}>{item.time}</Text>
                  {i < sortedTimeline.length - 1 && <View style={{ flex: 1, width: 1, backgroundColor: T.b1, marginTop: 5 }} />}
                </View>
                <View style={{ marginTop: 3 }}>
                  <View style={{ width: 9, height: 9, borderRadius: 4.5, backgroundColor: dotColor[item.status] || T.t3 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: "500", color: T.t1, lineHeight: 18 }}>{item.label}</Text>
                  <Text style={{ fontSize: 11, marginTop: 2, color: item.status === "done" ? T.green : T.t3 }}>{item.note}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </Card>
  );
}

// ── HomeTab ───────────────────────────────────────────────────────
export default function HomeTab() {
  const { state } = useApp();

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 14, paddingHorizontal: 14, paddingBottom: 90 }}>
      {/* AI Summary */}
      <View style={{
        backgroundColor: '#0A2A24', // Use a solid fallback or simple gradient equivalent
        borderRadius: T.r.xl, borderColor: `${T.teal}30`, borderWidth: 1,
        paddingVertical: 18, paddingHorizontal: 20, marginBottom: 12, overflow: "hidden",
      }}>
        <View style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: 70, borderColor: `${T.teal}18`, borderWidth: 1 }} />
        <View style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: 40, borderColor: `${T.teal}25`, borderWidth: 1 }} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: T.tealDim, borderColor: `${T.teal}55`, borderWidth: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 14 }}>🤖</Text>
          </View>
          <Text style={{ fontSize: 11, fontWeight: "700", color: T.teal, letterSpacing: 1, textTransform: "uppercase" }}>AI 요약</Text>
          <Pill color={T.teal} style={{ marginLeft: "auto", fontSize: 10 }}>실시간</Pill>
        </View>
        <Text style={{ fontSize: 14, lineHeight: 24, color: T.tealText }}>
          <Text style={{ color: T.teal, fontWeight: "bold" }}>{state.elder.name}</Text> 님은 현재 평온한 상태이며,
          아침 약 복용을 완료하셨습니다. 오늘 활동량은 평균 수준입니다.
        </Text>
      </View>

      <VitalsCard />
      <HomeCamCard />
      <MedicationCard />
      <TimelineCard />

      {/* Device status */}
      <Card>
        <SectionLabel>기기 상태</SectionLabel>
        {[
          ["웨어러블 배터리", `${state.device.wearableBattery}%`, T.green],
          ["홈캠 연결",       state.device.camConnected ? "정상" : "오프라인", state.device.camConnected ? T.green : T.red],
          ["AI 낙상 감지",    state.device.aiActive ? "활성화" : "비활성화", state.device.aiActive ? T.teal : T.t3],
        ].map(([k,v,c], i, arr) => (
          <View key={k} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 9, borderBottomColor: T.b1, borderBottomWidth: i < arr.length - 1 ? 1 : 0 }}>
            <Text style={{ fontSize: 13, color: T.t2 }}>{k}</Text>
            <Text style={{ fontSize: 13, fontWeight: "700", color: c }}>{v}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}
