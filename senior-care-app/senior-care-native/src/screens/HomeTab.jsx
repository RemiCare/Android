import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, Alert, SafeAreaView, TextInput } from "react-native";
import { WebView } from "react-native-webview";
import { T } from "../tokens";
import { Card, SectionLabel, Pill, ProgressRing, Divider, EmptyState } from "../components/UI";
import { useVitals } from "../hooks/useVitals";
import { useMedication } from "../hooks/useMedication";
import { useTimeline } from "../hooks/useTimeline";
import { useNotifications } from "../hooks/useNotifications";
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

// ── Elder Tabs ────────────────────────────────────────────────────
function ElderTabs() {
  const { state, selectElder } = useApp();
  const elders = state.elders || [];
  if (elders.length <= 1) return null;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
      {elders.map(e => {
        const active = e.id === state.selectedElderId;
        return (
          <TouchableOpacity key={e.id} onPress={() => selectElder(e.id)}
            style={{ paddingVertical: 5, paddingHorizontal: 14, borderRadius: 99,
              backgroundColor: active ? T.tealDim : T.bg3,
              borderColor: active ? T.teal : T.b2, borderWidth: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: active ? T.teal : T.t3 }}>{e.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
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
      <ElderTabs />

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
function camViewJsx(live, feedUrl, height = 220) {
  if (!live) {
    return (
      <View style={{ height, backgroundColor: "#111", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: T.t3, fontSize: 13 }}>연결 끊김</Text>
      </View>
    );
  }
  if (!feedUrl) {
    return (
      <View style={{ height, backgroundColor: "#111", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <Text style={{ fontSize: 22 }}>📷</Text>
        <Text style={{ color: T.t3, fontSize: 12 }}>AI 서버 주소 미설정</Text>
        <Text style={{ color: T.t3, fontSize: 11 }}>설정 탭에서 주소를 입력해주세요.</Text>
      </View>
    );
  }
  const html = `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>*{margin:0;padding:0;background:#000}body{width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden}img{width:100%;height:100%;object-fit:cover}</style>
</head><body><img src="${feedUrl}"></body></html>`;

  return (
    <View style={{ height, backgroundColor: "#000" }}>
      <WebView
        source={{ html, baseUrl: feedUrl }}
        style={{ flex: 1, backgroundColor: "#000" }}
        scrollEnabled={false}
        originWhitelist={["*"]}
        mixedContentMode="always"
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        onError={() => {}}
      />
      <View style={{ position: "absolute", top: 10, left: 10, flexDirection: "row", alignItems: "center", gap: 6 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#E24B4A" }} />
        <Text style={{ color: "rgba(255,255,255,0.9)", fontWeight: "bold", fontSize: 10 }}>LIVE</Text>
      </View>
    </View>
  );
}

function HomeCamCard() {
  const { state } = useApp();
  const [cameras, setCameras] = useState(["거실"]);
  const [cam, setCam] = useState("거실");
  const [live, setLive] = useState(true);
  const [motion, setMotion] = useState(true);
  const [full, setFull] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newCamName, setNewCamName] = useState("");

  const feedUrl = state.aiServerUrl ? `${state.aiServerUrl}/video/feed` : null;

  const handleAddCamera = () => {
    const name = newCamName.trim();
    if (!name) return;
    if (cameras.includes(name)) { Alert.alert("알림", "이미 추가된 위치입니다."); return; }
    setCameras(prev => [...prev, name]);
    setCam(name);
    setNewCamName("");
    setAddOpen(false);
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ borderTopColor: T.b1, borderTopWidth: 1 }}>
          <View style={{ flexDirection: "row" }}>
            {cameras.map(loc => (
              <TouchableOpacity key={loc} onPress={() => setCam(loc)} style={{ paddingVertical: 9, paddingHorizontal: 12, borderBottomColor: cam === loc ? T.teal : "transparent", borderBottomWidth: 2 }}>
                <Text style={{ fontSize: 12, fontWeight: cam === loc ? "700" : "400", color: cam === loc ? T.teal : T.t3 }}>{loc}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setAddOpen(true)} style={{ paddingVertical: 9, paddingHorizontal: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: T.blue }}>+ 추가</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {camViewJsx(live, feedUrl, 220)}

        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8, paddingVertical: 10, paddingHorizontal: 13 }}>
          {[
            { label: live ? "연결 중단" : "재연결", color: live ? T.red : T.green, dim: live ? T.redDim : T.greenDim, action: () => setLive(!live) },
            { label: `움직임 ${motion ? "ON" : "OFF"}`, color: motion ? T.amber : T.t3, dim: motion ? T.amberDim : T.bg4, action: () => setMotion(!motion) },
          ].map(b => (
            <TouchableOpacity key={b.label} onPress={b.action} style={{ flex: 1, paddingVertical: 8, borderRadius: T.r.sm, backgroundColor: b.dim, borderColor: `${b.color}33`, borderWidth: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 11, fontWeight: "600", color: b.color }}>{b.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* 전체화면 모달 */}
      <Modal visible={full} animationType="slide" onRequestClose={() => setFull(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, paddingHorizontal: 20, borderBottomColor: T.b1, borderBottomWidth: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#fff" }}>RemiCare Cam — {cam}</Text>
            <TouchableOpacity onPress={() => setFull(false)} style={{ backgroundColor: T.bg4, borderColor: T.b2, borderWidth: 1, borderRadius: T.r.sm, paddingVertical: 6, paddingHorizontal: 14 }}>
              <Text style={{ color: T.t1, fontSize: 13 }}>닫기</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, justifyContent: "center" }}>
            {camViewJsx(live, feedUrl, 360)}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ borderTopColor: T.b1, borderTopWidth: 1, maxHeight: 52, backgroundColor: "#000" }}>
            <View style={{ flexDirection: "row" }}>
              {cameras.map(loc => (
                <TouchableOpacity key={loc} onPress={() => setCam(loc)} style={{ paddingVertical: 14, paddingHorizontal: 16, borderTopColor: cam === loc ? T.teal : "transparent", borderTopWidth: 2 }}>
                  <Text style={{ fontSize: 12, fontWeight: cam === loc ? "700" : "400", color: cam === loc ? T.teal : "rgba(255,255,255,.5)" }}>{loc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 카메라 추가 모달 (Alert.prompt 대체 — Android 호환) */}
      <Modal visible={addOpen} transparent animationType="fade" onRequestClose={() => setAddOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,.6)", justifyContent: "center", alignItems: "center", padding: 32 }}>
          <View style={{ width: "100%", backgroundColor: T.bg2, borderRadius: T.r.lg, padding: 24, borderColor: T.b2, borderWidth: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: T.t1, marginBottom: 14 }}>카메라 위치 추가</Text>
            <TextInput
              style={{ backgroundColor: T.bg3, borderColor: T.b2, borderWidth: 1, borderRadius: T.r.sm, paddingVertical: 11, paddingHorizontal: 14, fontSize: 14, color: T.t1, marginBottom: 16 }}
              placeholder="예) 안방, 마당"
              placeholderTextColor={T.t3}
              value={newCamName}
              onChangeText={setNewCamName}
              autoFocus
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity onPress={() => { setAddOpen(false); setNewCamName(""); }} style={{ flex: 1, paddingVertical: 11, borderRadius: T.r.sm, backgroundColor: T.bg3, borderColor: T.b2, borderWidth: 1, alignItems: "center" }}>
                <Text style={{ color: T.t2, fontSize: 14, fontWeight: "600" }}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddCamera} style={{ flex: 1, paddingVertical: 11, borderRadius: T.r.sm, backgroundColor: T.teal, alignItems: "center" }}>
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>추가</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ── Timeline ──────────────────────────────────────────────────────
function TimelineCard() {
  const { todayTimeline, toggleComplete } = useTimeline();
  const dotColor = { done: T.green, warn: T.amber, wait: T.t3 };
  const dayStr = ["일", "월", "화", "수", "목", "금", "토"][new Date().getDay()];

  const sortedTimeline = [...todayTimeline].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <Card>
      <SectionLabel>
        오늘의 일정 ({dayStr}요일)
      </SectionLabel>
      <ElderTabs />

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
              <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: "500", color: T.t1, lineHeight: 18 }}>{item.label}</Text>
                  <Text style={{ fontSize: 11, marginTop: 2, color: item.status === "done" ? T.green : T.t3 }}>{item.note}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleComplete(item.id)}
                  style={{
                    paddingVertical: 4, paddingHorizontal: 10, borderRadius: 99,
                    backgroundColor: item.status === "done" ? `${T.green}22` : T.bg4,
                    borderColor: item.status === "done" ? T.green : T.b2, borderWidth: 1,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "600", color: item.status === "done" ? T.green : T.t3 }}>
                    {item.status === "done" ? "✓ 완료" : "완료"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </Card>
  );
}

// ── Notifications Card ────────────────────────────────────────────
function NotificationsCard() {
  const { notifications, loading } = useNotifications();
  const [open, setOpen] = useState(false);

  const shown = open ? notifications : notifications.slice(0, 3);

  function fmtTime(iso) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return iso; }
  }

  return (
    <Card>
      <SectionLabel
        action={notifications.length > 3 ? (open ? "접기" : "더보기") : undefined}
        onAction={notifications.length > 3 ? () => setOpen(v => !v) : undefined}
      >
        알림 기록
      </SectionLabel>
      {loading ? (
        <Text style={{ fontSize: 12, color: T.t3, textAlign: "center", paddingVertical: 12 }}>불러오는 중...</Text>
      ) : shown.length === 0 ? (
        <EmptyState icon="🔔" title="알림 없음" desc="응급 알림이 발생하면 여기에 표시됩니다." />
      ) : (
        shown.map((n, i) => (
          <View key={n.id} style={{ paddingVertical: 11, borderBottomColor: T.b1, borderBottomWidth: i < shown.length - 1 ? 1 : 0 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: T.red, flex: 1 }} numberOfLines={1}>{n.title}</Text>
              <Text style={{ fontSize: 10, color: T.t3, marginLeft: 8 }}>{fmtTime(n.sentAt)}</Text>
            </View>
            <Text style={{ fontSize: 12, color: T.t2, lineHeight: 18 }} numberOfLines={2}>{n.message}</Text>
          </View>
        ))
      )}
    </Card>
  );
}

// ── HomeTab ───────────────────────────────────────────────────────
export default function HomeTab() {
  const { state } = useApp();
  const { vitals } = useVitals();
  const [aiResult, setAiResult] = useState(null);

  const callAiPredict = useCallback(async () => {
    if (!state.aiServerUrl || !state.elder?.id) return;
    const predictBase = state.aiServerUrl;
    try {
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
      const res = await fetch(`${predictBase}/ai/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          elderlyId:           state.elder.id,
          timestamp,
          Heartrate:           vitals.heartRate || 72,
          Breathrate:          16,
          SPO2:                vitals.oxygen    || 98,
          Walking_steps:       vitals.steps     || 0,
          Caloricexpenditure:  Math.round((vitals.steps || 0) * 0.04),
        }),
      });
      if (res.ok) setAiResult(await res.json());
    } catch {}
  }, [state.aiServerUrl, state.elder?.id, vitals.heartRate, vitals.oxygen, vitals.steps]);

  useEffect(() => {
    callAiPredict();
    const id = setInterval(callAiPredict, 30000);
    return () => clearInterval(id);
  }, [callAiPredict]);

  const isEmergency = aiResult?.predictionLabel?.includes("비정상");
  const fallbackText = state.user?.role === "elder"
    ? `안녕하세요, ${state.user.name}님. 현재 평온한 상태이며, 아침 약 복용을 완료하셨습니다. 오늘 활동량은 평균 수준입니다.`
    : `${state.elder?.name} 님은 현재 평온한 상태이며, 아침 약 복용을 완료하셨습니다. 오늘 활동량은 평균 수준입니다.`;
  const aiText = aiResult?.explanation || fallbackText;
  const pillColor = isEmergency ? T.red : T.teal;
  const pillLabel = isEmergency ? "⚠ 이상 감지" : "실시간";

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 14, paddingHorizontal: 14, paddingBottom: 90 }}>
      {/* AI Summary */}
      <View style={{
        backgroundColor: isEmergency ? "#FFF1F1" : "#EEF2FF",
        borderRadius: T.r.xl, borderColor: isEmergency ? `${T.red}40` : `${T.teal}30`, borderWidth: 1,
        paddingVertical: 18, paddingHorizontal: 20, marginBottom: 12, overflow: "hidden",
      }}>
        <View style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: 70, borderColor: `${pillColor}18`, borderWidth: 1 }} />
        <View style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: 40, borderColor: `${pillColor}25`, borderWidth: 1 }} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: T.tealDim, borderColor: `${T.teal}55`, borderWidth: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 14 }}>🤖</Text>
          </View>
          <Text style={{ fontSize: 11, fontWeight: "700", color: pillColor, letterSpacing: 1, textTransform: "uppercase" }}>AI 요약</Text>
          <Pill color={pillColor} style={{ marginLeft: "auto", fontSize: 10 }}>{pillLabel}</Pill>
        </View>
        <Text style={{ fontSize: 14, lineHeight: 24, color: T.t1 }}>{aiText}</Text>
      </View>

      <VitalsCard />
      {state.user?.role !== "elder" && <HomeCamCard />}
      <MedicationCard />
      <TimelineCard />
      {state.user?.role !== "elder" && <NotificationsCard />}

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
