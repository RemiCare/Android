import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, FlatList } from "react-native";
import { T } from "../tokens";
import { Card, SectionLabel, Button, EmptyState } from "../components/UI";
import { useMedication } from "../hooks/useMedication";
import { useTimeline } from "../hooks/useTimeline";
import { useApp } from "../context/AppContext";

// ── 어르신 탭 ─────────────────────────────────────────────────────
function ElderTabs() {
  const { state, selectElder } = useApp();
  const { elders, selectedElderId } = state;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {elders.map(elder => {
          const active = elder.id === selectedElderId;
          return (
            <TouchableOpacity
              key={elder.id}
              onPress={() => selectElder(elder.id)}
              style={{
                paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99,
                backgroundColor: active ? T.teal : T.bg4,
                borderColor: active ? T.teal : T.b2, borderWidth: 1,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "600", color: active ? "#fff" : T.t3 }}>
                {elder.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ── 어르신 관리 ───────────────────────────────────────────────────
function ElderManagement() {
  const { state, addElder, removeElder } = useApp();
  const { elders } = state;
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newAddr, setNewAddr] = useState("");

  const handleAdd = () => {
    if (!newName.trim()) { Alert.alert("알림", "어르신 이름을 입력해주세요."); return; }
    addElder({ name: newName.trim(), age: parseInt(newAge) || 70, address: newAddr.trim() || "미입력", conditions: [], photo: null });
    setNewName(""); setNewAge(""); setNewAddr(""); setIsAdding(false);
  };

  return (
    <Card>
      <SectionLabel action={isAdding ? "취소" : "어르신 추가"} onAction={() => setIsAdding(!isAdding)}>
        어르신 관리
      </SectionLabel>

      {isAdding && (
        <View style={{ backgroundColor: T.bg3, padding: 12, borderRadius: T.r.md, marginBottom: 12, borderColor: T.teal, borderWidth: 1 }}>
          <TextInput placeholder="이름 (예: 김순자)" placeholderTextColor={T.t3} value={newName} onChangeText={setNewName}
            style={{ backgroundColor: T.bg4, color: T.t1, padding: 10, borderRadius: T.r.sm, marginBottom: 8 }} />
          <TextInput placeholder="나이 (예: 78)" placeholderTextColor={T.t3} value={newAge} onChangeText={setNewAge} keyboardType="numeric"
            style={{ backgroundColor: T.bg4, color: T.t1, padding: 10, borderRadius: T.r.sm, marginBottom: 8 }} />
          <TextInput placeholder="주소 (예: 서울 마포구)" placeholderTextColor={T.t3} value={newAddr} onChangeText={setNewAddr}
            style={{ backgroundColor: T.bg4, color: T.t1, padding: 10, borderRadius: T.r.sm, marginBottom: 12 }} />
          <Button onPress={handleAdd}>저장하기</Button>
        </View>
      )}

      <View style={{ gap: 8 }}>
        {elders.map(elder => (
          <View key={elder.id} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: T.bg3, padding: 12, borderRadius: T.r.md }}>
            <View>
              <Text style={{ fontSize: 13, fontWeight: "600", color: T.t1 }}>{elder.name}</Text>
              <Text style={{ fontSize: 11, color: T.t3, marginTop: 2 }}>{elder.age}세 · {elder.address}</Text>
            </View>
            {elders.length > 1 && (
              <TouchableOpacity onPress={() => removeElder(elder.id)} style={{ padding: 6 }}>
                <Text style={{ color: T.red, fontWeight: "700" }}>삭제</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </Card>
  );
}

// 요일 상수
const DAYS_OF_WEEK = ["월", "화", "수", "목", "금", "토", "일"];

// ── ScrollTimePicker ──────────────────────────────────────────────
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

function TimeColumn({ data, selectedValue, onValueChange }) {
  const scrollRef = useRef(null);
  const items = ["", "", ...data, "", ""];

  useEffect(() => {
    const idx = data.indexOf(selectedValue);
    if (idx >= 0 && scrollRef.current) {
      scrollRef.current.scrollTo({ y: idx * ITEM_HEIGHT, animated: false });
    }
  }, []);

  const handleScroll = useCallback((e) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const idx = Math.round(offsetY / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(data.length - 1, idx));
    if (data[clamped] !== selectedValue) {
      onValueChange(data[clamped]);
    }
  }, [data, selectedValue, onValueChange]);

  const handleMomentumEnd = useCallback((e) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const idx = Math.round(offsetY / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(data.length - 1, idx));
    scrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
    onValueChange(data[clamped]);
  }, [data, onValueChange]);

  return (
    <View style={{ width: 64, height: PICKER_HEIGHT, overflow: "hidden" }}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumEnd}
        scrollEventThrottle={16}
      >
        {items.map((item, i) => (
          <View key={i} style={{ height: ITEM_HEIGHT, alignItems: "center", justifyContent: "center" }}>
            <Text style={{
              fontSize: item === selectedValue ? 22 : 16,
              fontWeight: item === selectedValue ? "700" : "400",
              color: item === selectedValue ? T.teal : T.t3,
            }}>
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function ScrollTimePicker({ value, onChange }) {
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = ["00", "15", "30", "45"];
  const [h, m] = value ? value.split(":") : ["09", "00"];

  return (
    <View style={{ backgroundColor: T.bg4, borderRadius: T.r.md, paddingVertical: 4, marginBottom: 12 }}>
      {/* 선택 영역 하이라이트 */}
      <View style={{ position: "absolute", top: ITEM_HEIGHT * 2 + 4, left: 0, right: 0, height: ITEM_HEIGHT, borderTopWidth: 1, borderBottomWidth: 1, borderColor: `${T.teal}55`, pointerEvents: "none" }} />
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 }}>
        <TimeColumn
          data={hours}
          selectedValue={h}
          onValueChange={(newH) => onChange(`${newH}:${m}`)}
        />
        <Text style={{ fontSize: 22, fontWeight: "700", color: T.t2, marginBottom: 2 }}>:</Text>
        <TimeColumn
          data={minutes}
          selectedValue={minutes.includes(m) ? m : "00"}
          onValueChange={(newM) => onChange(`${h}:${newM}`)}
        />
      </View>
      <Text style={{ fontSize: 10, color: T.t3, textAlign: "center", paddingBottom: 4 }}>
        스크롤하여 시간 선택
      </Text>
    </View>
  );
}

function WearableSettings() {
  const { state, dispatch } = useApp();
  const device = state.device;
  const isConnected = device.camConnected;
  const [loading, setLoading] = useState(false);

  const toggleConnection = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(isConnected ? "연결 해제" : "연결 완료", isConnected ? "기기 연결이 해제되었습니다." : "기기가 성공적으로 연결되었습니다.");
    }, 800);
  };

  return (
    <Card>
      <SectionLabel>웨어러블 기기 연동</SectionLabel>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: T.bg3, borderColor: isConnected ? T.teal : T.b2, borderWidth: 2, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 20 }}>⌚</Text>
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: "600", color: T.t1 }}>RemiWatch Pro</Text>
            <Text style={{ fontSize: 12, color: isConnected ? T.teal : T.t3, marginTop: 2 }}>{isConnected ? `연결됨 · 배터리 ${device.wearableBattery}%` : "연결 안됨"}</Text>
          </View>
        </View>
      </View>
      <Button onPress={toggleConnection} loading={loading} variant={isConnected ? "ghost" : "primary"}>
        {isConnected ? "기기 연결 해제" : "새 기기 연결하기"}
      </Button>
    </Card>
  );
}

function MedicationSettings() {
  const { meds, addMed, removeMed } = useMedication();
  const { state } = useApp();
  const elderName = state.elder?.name || "";
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTime, setNewTime] = useState("09:00");
  const [selectedDays, setSelectedDays] = useState([]);

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleAdd = () => {
    if (!newName) {
      Alert.alert("알림", "약 이름을 입력해주세요.");
      return;
    }
    if (selectedDays.length === 0) {
      Alert.alert("알림", "복용할 요일을 하나 이상 선택해주세요.");
      return;
    }

    addMed({
      id: Date.now(),
      name: newName,
      times: [newTime],
      days: selectedDays,
      taken: [false],
      color: T.teal,
    });

    setNewName("");
    setNewTime("09:00");
    setSelectedDays([]);
    setIsAdding(false);
  };

  return (
    <Card>
      <SectionLabel action={isAdding ? "취소" : "추가"} onAction={() => setIsAdding(!isAdding)}>
        복약 설정 · {elderName}
      </SectionLabel>
      <ElderTabs />

      {isAdding && (
        <View style={{ backgroundColor: T.bg3, padding: 12, borderRadius: T.r.md, marginBottom: 12, borderColor: T.teal, borderWidth: 1 }}>
          <TextInput
            placeholder="약 이름 (예: 혈압약)"
            placeholderTextColor={T.t3}
            value={newName}
            onChangeText={setNewName}
            style={{ backgroundColor: T.bg4, color: T.t1, padding: 10, borderRadius: T.r.sm, marginBottom: 12 }}
          />

          {/* 스크롤 시간 피커 */}
          <Text style={{ fontSize: 11, fontWeight: "600", color: T.t3, marginBottom: 8, letterSpacing: 0.4 }}>
            복용 시간
          </Text>
          <ScrollTimePicker value={newTime} onChange={setNewTime} />

          {/* 요일 선택 UI */}
          <Text style={{ fontSize: 11, fontWeight: "600", color: T.t3, marginBottom: 8, letterSpacing: 0.4 }}>
            복용 요일
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            {DAYS_OF_WEEK.map(day => {
              const isSelected = selectedDays.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => toggleDay(day)}
                  style={{
                    width: 36, height: 36, borderRadius: 18,
                    alignItems: "center", justifyContent: "center",
                    backgroundColor: isSelected ? T.teal : T.bg4,
                  }}
                >
                  <Text style={{ color: isSelected ? "#fff" : T.t3, fontSize: 13, fontWeight: isSelected ? "700" : "500" }}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button onPress={handleAdd}>저장하기</Button>
        </View>
      )}

      {meds.length === 0 ? (
        <EmptyState icon="💊" title="등록된 약이 없습니다" desc="우측 상단의 추가를 눌러주세요." />
      ) : (
        <View style={{ gap: 8 }}>
          {meds.map(med => (
            <View key={med.id} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: T.bg3, padding: 12, borderRadius: T.r.md }}>
              <View>
                <Text style={{ fontSize: 13, fontWeight: "600", color: T.t1 }}>{med.name}</Text>
                <Text style={{ fontSize: 11, color: T.t3, marginTop: 4 }}>
                  요일: {med.days ? med.days.join(", ") : "매일"} | 시간: {med.times.join(", ")}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeMed(med.id)} style={{ padding: 6 }}>
                <Text style={{ color: T.red, fontWeight: "700" }}>삭제</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

function ScheduleSettings() {
  const { timeline, addTimelineItem, removeTimelineItem } = useTimeline();
  const { state } = useApp();
  const elderName = state.elder?.name || "";
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newTime, setNewTime] = useState("10:00");
  const [selectedDays, setSelectedDays] = useState([]);

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleAdd = () => {
    if (!newLabel) {
      Alert.alert("알림", "일정 내용을 입력해주세요.");
      return;
    }
    if (selectedDays.length === 0) {
      Alert.alert("알림", "일정을 등록할 요일을 하나 이상 선택해주세요.");
      return;
    }

    addTimelineItem({
      id: `t_${Date.now()}`,
      time: newTime,
      label: newLabel,
      days: selectedDays,
      status: "wait",
      note: "예정",
    });

    setNewLabel("");
    setNewTime("10:00");
    setSelectedDays([]);
    setIsAdding(false);
  };

  const sortedTimeline = [...timeline].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <Card>
      <SectionLabel action={isAdding ? "취소" : "추가"} onAction={() => setIsAdding(!isAdding)}>
        일정 설정 · {elderName}
      </SectionLabel>
      <ElderTabs />

      {isAdding && (
        <View style={{ backgroundColor: T.bg3, padding: 12, borderRadius: T.r.md, marginBottom: 12, borderColor: T.teal, borderWidth: 1 }}>
          <TextInput
            placeholder="일정 내용 (예: 병원 방문)"
            placeholderTextColor={T.t3}
            value={newLabel}
            onChangeText={setNewLabel}
            style={{ backgroundColor: T.bg4, color: T.t1, padding: 10, borderRadius: T.r.sm, marginBottom: 12 }}
          />

          {/* 스크롤 시간 피커 */}
          <Text style={{ fontSize: 11, fontWeight: "600", color: T.t3, marginBottom: 8, letterSpacing: 0.4 }}>
            시간
          </Text>
          <ScrollTimePicker value={newTime} onChange={setNewTime} />

          {/* 요일 선택 UI */}
          <Text style={{ fontSize: 11, fontWeight: "600", color: T.t3, marginBottom: 8, letterSpacing: 0.4 }}>
            요일
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            {DAYS_OF_WEEK.map(day => {
              const isSelected = selectedDays.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => toggleDay(day)}
                  style={{
                    width: 36, height: 36, borderRadius: 18,
                    alignItems: "center", justifyContent: "center",
                    backgroundColor: isSelected ? T.teal : T.bg4,
                  }}
                >
                  <Text style={{ color: isSelected ? "#fff" : T.t3, fontSize: 13, fontWeight: isSelected ? "700" : "500" }}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button onPress={handleAdd}>저장하기</Button>
        </View>
      )}

      {sortedTimeline.length === 0 ? (
        <EmptyState icon="🗓" title="등록된 일정이 없습니다" desc="우측 상단의 추가를 눌러주세요." />
      ) : (
        <View style={{ gap: 8 }}>
          {sortedTimeline.map(item => (
            <View key={item.id} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: T.bg3, padding: 12, borderRadius: T.r.md }}>
              <View>
                <Text style={{ fontSize: 13, fontWeight: "600", color: T.t1 }}>{item.label}</Text>
                <Text style={{ fontSize: 11, color: T.t3, marginTop: 4 }}>
                  요일: {item.days ? item.days.join(", ") : "매일"} | 시간: {item.time}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeTimelineItem(item.id)} style={{ padding: 6 }}>
                <Text style={{ color: T.red, fontWeight: "700" }}>삭제</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

export default function SettingsTab() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 14, paddingHorizontal: 14, paddingBottom: 90 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", color: T.t1, marginBottom: 16, paddingHorizontal: 4 }}>
        설정
      </Text>

      <ElderManagement />
      <WearableSettings />
      <MedicationSettings />
      <ScheduleSettings />

    </ScrollView>
  );
}