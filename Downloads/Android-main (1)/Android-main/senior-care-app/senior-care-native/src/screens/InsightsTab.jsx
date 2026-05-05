import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, SafeAreaView, Dimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { T } from "../tokens";
import { Card, SectionLabel, Pill, Button, EmptyState } from "../components/UI";
import { useEmergency, SEV } from "../hooks/useEmergency";

const weeklyData = [
  { label: "월", activity: 45, outing: 80, sleep: 70 },
  { label: "화", activity: 60, outing: 60, sleep: 75 },
  { label: "수", activity: 52, outing: 40, sleep: 65 },
  { label: "목", activity: 70, outing: 55, sleep: 80 },
  { label: "금", activity: 48, outing: 30, sleep: 60 },
  { label: "토", activity: 65, outing: 20, sleep: 55 },
  { label: "일", activity: 72, outing: 22, sleep: 71 },
];

const monthlyData = Array.from({ length: 30 }, (_, i) => ({
  label: `${i + 1}`,
  activity: 45 + Math.round(Math.sin(i * 0.4) * 15),
  outing: Math.max(5, 80 - i * 2),
  sleep: 65 + Math.round(Math.sin(i * 0.3) * 10)
}));

function EmergencyBriefing() {
  const { filter, setFilter, selectedId, toggleSelected, filtered, highCount } = useEmergency();

  return (
    <Card>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <SectionLabel>AI 응급 브리핑</SectionLabel>
        {highCount > 0 && <Pill color={T.red} dim={T.redDim} border="rgba(248,113,113,.3)">{`${highCount}건 고위험`}</Pill>}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", gap: 5 }}>
          {["all", "high", "mid", "low"].map(f => {
            const s = SEV[f];
            const active = filter === f;
            return (
              <TouchableOpacity key={f} onPress={() => setFilter(f)} style={{
                paddingVertical: 4, paddingHorizontal: 10, borderRadius: 99,
                borderColor: active ? (s?.color || T.teal) + "55" : T.b2, borderWidth: 1,
                backgroundColor: active ? (s?.bg || T.tealDim) : T.bg4,
              }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: active ? (s?.color || T.teal) : T.t3 }}>
                  {f === "all" ? "전체" : s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {filtered.length === 0 ? (
        <EmptyState icon="✓" title="이상 없음" desc="선택한 기간에 응급 이벤트가 없습니다." />
      ) : (
        <View style={{ gap: 6 }}>
          {filtered.map(ev => {
            const s = SEV[ev.severity];
            const isOpen = selectedId === ev.id;
            return (
              <View key={ev.id} style={{ borderRadius: T.r.md, overflow: "hidden", borderColor: s.border, borderWidth: 1 }}>
                <TouchableOpacity onPress={() => toggleSelected(ev.id)} style={{ backgroundColor: s.bg, paddingVertical: 10, paddingHorizontal: 13 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: s.color }} />
                      <Text style={{ fontSize: 13, fontWeight: "700", color: s.color }}>{ev.type}</Text>
                      <View style={{ backgroundColor: "rgba(0,0,0,.12)", borderRadius: 6, paddingVertical: 1, paddingHorizontal: 7 }}>
                        <Text style={{ fontSize: 10, color: s.color }}>{ev.source}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={{ fontSize: 11, fontWeight: "700", color: s.color }}>자세히 보기</Text>
                      <Text style={{ fontSize: 10, color: s.color }}>{isOpen ? "▲" : "▼"}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 10, color: s.color, opacity: 0.7, marginTop: 3 }}>{ev.date}</Text>
                </TouchableOpacity>
                {isOpen && (
                  <View style={{ backgroundColor: T.bg3, paddingVertical: 12, paddingHorizontal: 14, borderTopColor: s.border, borderTopWidth: 1 }}>
                    <Text style={{ fontSize: 12, lineHeight: 20, color: T.t2 }}>{ev.detail}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}

export default function InsightsTab() {
  const [period, setPeriod] = useState("week");
  const [showSheet, setShowSheet] = useState(false);
  const [selPeriod, setSelPeriod] = useState("최근 1주일");
  const data = period === "week" ? weeklyData : monthlyData;

  const lineData1 = data.map(d => ({ value: d.activity, label: d.label }));
  const lineData2 = data.map(d => ({ value: d.outing, label: d.label }));
  const lineData3 = data.map(d => ({ value: d.sleep, label: d.label }));

  const screenWidth = Dimensions.get("window").width;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 14, paddingHorizontal: 14, paddingBottom: 90 }}>
      <View style={{ flexDirection: "row", gap: 6, marginBottom: 12 }}>
        {["week", "month"].map(p => (
          <TouchableOpacity key={p} onPress={() => setPeriod(p)} style={{
            paddingVertical: 6, paddingHorizontal: 16, borderRadius: 99,
            backgroundColor: period === p ? T.teal : T.bg4,
            borderColor: period === p ? T.teal : T.b2, borderWidth: 1,
          }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: period === p ? T.bg0 : T.t3 }}>
              {p === "week" ? "주간" : "월간"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Card>
        <SectionLabel>활동량 트렌드</SectionLabel>
        <View style={{ marginLeft: -10, marginTop: 10 }}>
          <LineChart
            data={lineData1}
            data2={lineData2}
            data3={lineData3}
            color1={T.teal}
            color2={T.green}
            color3={T.amber}
            thickness1={2}
            thickness2={2}
            thickness3={2}
            hideDataPoints
            xAxisColor={T.b1}
            yAxisColor={T.b1}
            yAxisTextStyle={{ color: T.t3, fontSize: 9 }}
            xAxisLabelTextStyle={{ color: T.t3, fontSize: 9 }}
            width={screenWidth - 80}
            height={150}
            spacing={period === "week" ? (screenWidth - 100) / 7 : (screenWidth - 100) / 30}
            initialSpacing={10}
            rulesColor={T.b1}
            yAxisSide="right"
          />
        </View>
        <View style={{ flexDirection: "row", gap: 14, marginTop: 16 }}>
          {[[T.teal, "활동량"], [T.green, "외출 빈도"], [T.amber, "수면 규칙성"]].map(([c, n]) => (
            <View key={n} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <View style={{ width: 12, height: 2, backgroundColor: c, borderRadius: 1 }} />
              <Text style={{ fontSize: 10, color: T.t3 }}>{n}</Text>
            </View>
          ))}
        </View>
      </Card>

      <View style={{ backgroundColor: T.amberDim, borderRadius: T.r.lg, borderColor: `${T.amber}33`, borderWidth: 1, paddingVertical: 15, paddingHorizontal: 17, marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Text>⚠</Text>
          <Text style={{ fontSize: 11, fontWeight: "700", color: T.amber, letterSpacing: 0.8 }}>AI 건강 지침</Text>
        </View>
        <Text style={{ fontSize: 13, lineHeight: 22, color: "#D97706" }}>
          최근 2주간 <Text style={{ fontWeight: "bold" }}>외출 빈도 80% 감소</Text>, 낮잠 시간 증가. 가벼운 우울감이나 관절 통증이 원인일 수 있습니다. 이번 주말 산책을 권해 보세요.
        </Text>
      </View>

      <Card>
        <SectionLabel>미세 건강 지표</SectionLabel>
        {[["수면 규칙성", 71, T.blue], ["외출 빈도", 22, T.amber], ["식사 규칙성", 88, T.green]].map(([lbl, val, col]) => (
          <View key={lbl} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
              <Text style={{ fontSize: 12, color: T.t2 }}>{lbl}</Text>
              <Text style={{ fontSize: 12, fontWeight: "700", color: col }}>{val}%</Text>
            </View>
            <View style={{ height: 4, backgroundColor: T.bg4, borderRadius: 99 }}>
              <View style={{ width: `${val}%`, height: "100%", backgroundColor: col, borderRadius: 99 }} />
            </View>
          </View>
        ))}
      </Card>

      <EmergencyBriefing />

      <Button onPress={() => setShowSheet(true)} style={{ backgroundColor: '#0F6E56', marginTop: 10 }}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>🏥 병원 진료용 PDF 리포트 발급</Text>
      </Button>

      <Modal visible={showSheet} transparent animationType="slide" onRequestClose={() => setShowSheet(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,.6)", justifyContent: "flex-end" }}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowSheet(false)} />
          <View style={{ backgroundColor: T.bg2, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingVertical: 22, paddingHorizontal: 20, paddingBottom: 40 }}>
            <View style={{ width: 36, height: 4, backgroundColor: T.b2, borderRadius: 99, alignSelf: "center", marginBottom: 18 }} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: T.t1, marginBottom: 5 }}>리포트 기간 선택</Text>
            <Text style={{ fontSize: 13, color: T.t3, marginBottom: 14 }}>병원 진료 시 제출하실 건강 리포트를 생성합니다.</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              {["최근 1주일", "최근 1개월"].map(p => (
                <TouchableOpacity key={p} onPress={() => setSelPeriod(p)} style={{
                  flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: T.r.md,
                  borderColor: selPeriod === p ? T.teal : T.b2, borderWidth: 1,
                  backgroundColor: selPeriod === p ? T.tealDim : T.bg3,
                }}>
                  <Text style={{ color: selPeriod === p ? T.teal : T.t3, fontSize: 13, fontWeight: selPeriod === p ? "700" : "400" }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button onPress={() => { setShowSheet(false); alert("PDF 생성 중... (실제 환경에서는 파일로 다운로드됩니다)"); }}>
              PDF 생성 및 다운로드
            </Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
