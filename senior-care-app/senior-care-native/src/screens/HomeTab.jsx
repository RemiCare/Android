import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, Alert, SafeAreaView } from "react-native";
import { WebView } from "react-native-webview";
import { T } from "../tokens";
import { Card, SectionLabel, Pill, ProgressRing, Divider, EmptyState } from "../components/UI";
import { useVitals } from "../hooks/useVitals";
import { useMedication } from "../hooks/useMedication";
import { useTimeline } from "../hooks/useTimeline";
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
            { val: vitals.heartRate, unit: "bpm", label: "심박수", color: "#F06292", icon: "♥" },
            { val: vitals.steps || "5,432", unit: "걸음", label: "걸음수", color: T.green, icon: "◆" },
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
  const { todayMeds, toggleTaken, stats, nextMed } = useMedication();
  const [open, setOpen] = useState(false);
  const dayStr = ["일", "월", "화", "수", "목", "금", "토"][new Date().getDay()];

  return (
    <Card>
      <SectionLabel action={open ? "접기" : "상세보기"} onAction={() => setOpen(!open)}>
        복약 관리 ({dayStr}요일)
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
        <View style={{ marginTop: 12 }}>
          <Divider />
          {todayMeds.length === 0 ? (
            <EmptyState icon="💊" title="오늘 복약 없음" desc="설정 탭에서 요일을 확인하세요." />
          ) : (() => {
            const items = todayMeds
              .flatMap(med => med.times.map((t, ti) => ({
                key: `${med.id}-${ti}`, time: t,
                name: med.name, color: med.color,
                taken: med.taken[ti], medId: med.id, timeIndex: ti,
              })))
              .sort((a, b) => a.time.localeCompare(b.time));
            return (
              <View style={{ marginTop: 10 }}>
                {items.map((item, i) => (
                  <View key={item.key} style={{ flexDirection: "row", gap: 12, paddingBottom: i < items.length - 1 ? 13 : 0 }}>
                    <View style={{ alignItems: "center", width: 38 }}>
                      <Text style={{ fontSize: 10, color: T.t3 }}>{item.time}</Text>
                      {i < items.length - 1 && <View style={{ flex: 1, width: 1, backgroundColor: T.b1, marginTop: 5 }} />}
                    </View>
                    <View style={{ marginTop: 3 }}>
                      <View style={{ width: 9, height: 9, borderRadius: 4.5, backgroundColor: item.taken ? item.color : T.t3 }} />
                    </View>
                    <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <View>
                        <Text style={{ fontSize: 13, fontWeight: "500", color: T.t1, lineHeight: 18 }}>{item.name}</Text>
                        <Text style={{ fontSize: 11, marginTop: 2, color: item.taken ? item.color : T.t3 }}>
                          {item.taken ? "✓ 복용 완료" : "미복용"}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => toggleTaken(item.medId, item.timeIndex)}
                        style={{
                          paddingVertical: 4, paddingHorizontal: 12, borderRadius: 99,
                          backgroundColor: item.taken ? `${item.color}22` : T.bg4,
                          borderColor: item.taken ? item.color : T.b2, borderWidth: 1,
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: "600", color: item.taken ? item.color : T.t3 }}>
                          {item.taken ? "✓" : "○"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                <Text style={{ fontSize: 11, color: T.t3, marginTop: 14 }}>* 복약 추가/수정은 설정 탭에서 가능합니다.</Text>
              </View>
            );
          })()}
        </View>
      )}
    </Card>
  );
}

// ── HomeCam Card ──────────────────────────────────────────────────
function HomeCamCard() {
  const { state } = useApp();
  const [cameras, setCameras] = useState(["거실"]);
  const [cam, setCam] = useState("거실");
  const [live, setLive] = useState(true);
  const [motion, setMotion] = useState(true);
  const [full, setFull] = useState(false);

  const feedUrl = state.aiServerUrl ? `${state.aiServerUrl}/video/feed` : null;

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

  const CamView = ({ height = 220 }) => {
    if (!live) {
      return (
        <View style={{ height, backgroundColor: "#E8E8E8", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: T.t2, fontSize: 13 }}>연결 끊김</Text>
        </View>
      );
    }
    if (!feedUrl) {
      return (
        <View style={{ height, backgroundColor: "#E8E8E8", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Text style={{ fontSize: 22 }}>📷</Text>
          <Text style={{ color: T.t3, fontSize: 12 }}>AI 서버 주소 미설정</Text>
          <Text style={{ color: T.t3, fontSize: 11 }}>설정 탭에서 주소를 입력해주세요.</Text>
        </View>
      );
    }
    return (
      <View style={{ height, backgroundColor: "#E8E8E8" }}>
        <WebView
          source={{ uri: feedUrl }}
          style={{ flex: 1, backgroundColor: "#E8E8E8" }}
          scrollEnabled={false}
          onError={() => {}}
        />
        <View style={{ position: "absolute", top: 10, left: 10, flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#E24B4A" }} />
          <Text style={{ color: "rgba(255,255,255,0.9)", fontWeight: "bold", fontSize: 10 }}>LIVE</Text>
        </View>
      </View>
    );
  };

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
                <Text style={{ fontSize: 12, fontWeight: cam === loc ? "700" : "400", color: cam === loc ? T.teal : "rgba(0,0,0,.4)" }}>{loc}</Text>
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
  const { todayTimeline } = useTimeline();
  const dotColor = { done: T.green, warn: T.amber, wait: T.t3 };
  const dayStr = ["일", "월", "화", "수", "목", "금", "토"][new Date().getDay()];

  const sortedTimeline = [...todayTimeline].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <Card>
      <SectionLabel>
        오늘의 일정 ({dayStr}요일)
      </SectionLabel>

      <View style={{ marginTop: 10 }}>
        {sortedTimeline.length === 0 ? (
          <EmptyState icon="🗓" title="일정 없음" desc="설정 탭에서 일정을 추가하세요." />
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
        backgroundColor: '#EEF2FF',
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
        <Text style={{ fontSize: 14, lineHeight: 24, color: T.t1 }}>
          <Text style={{ color: T.t1, fontWeight: "bold" }}>{state.elder.name}</Text> 님은 현재 평온한 상태이며,
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
