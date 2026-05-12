import React, { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { T } from "../tokens";
import { Card, SectionLabel, Button, EmptyState } from "../components/UI";
import { useMedication } from "../hooks/useMedication";
import { useTimeline } from "../hooks/useTimeline";
import { useApp } from "../context/AppContext";

const DAY_KEYS  = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_LABEL = { sun: "일", mon: "월", tue: "화", wed: "수", thu: "목", fri: "금", sat: "토" };
const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const ALL_DAYS  = [...DAY_KEYS];
const HOURS     = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES   = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
const ITEM_H    = 44;

function DaySelector({ selected, onToggle }) {
  return (
    <View style={{ flexDirection: "row", gap: 5 }}>
      {DAY_ORDER.map(key => {
        const active = selected.includes(key);
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onToggle(key)}
            style={{
              flex: 1, paddingVertical: 8, borderRadius: T.r.sm,
              backgroundColor: active ? T.tealDim : T.bg4,
              borderColor: active ? T.teal : T.b2, borderWidth: 1,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: active ? "700" : "400", color: active ? T.teal : T.t3 }}>
              {DAY_LABEL[key]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function PickerColumn({ data, value, onChange }) {
  const ref = useRef(null);
  const idx = Math.max(0, data.indexOf(value));

  useEffect(() => {
    const timer = setTimeout(() => {
      ref.current?.scrollTo({ y: idx * ITEM_H, animated: false });
    }, 80);
    return () => clearTimeout(timer);
  }, [idx]);

  const onScrollEnd = (e) => {
    const i = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
    const next = data[Math.max(0, Math.min(i, data.length - 1))];
    if (next !== value) onChange(next);
  };

  return (
    <View style={{ width: 60, height: ITEM_H * 3 }}>
      <View style={{
        position: "absolute", top: ITEM_H, left: 0, right: 0, height: ITEM_H,
        backgroundColor: `${T.teal}18`,
        borderTopWidth: 1, borderBottomWidth: 1, borderColor: `${T.teal}55`,
        borderRadius: 8,
      }} />
      <ScrollView
        ref={ref}
        style={{ flex: 1 }}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        contentContainerStyle={{ paddingVertical: ITEM_H }}
      >
        {data.map(item => (
          <View key={item} style={{ height: ITEM_H, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "600", color: item === value ? T.teal : T.t3 }}>
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function TimePicker({ value = "09:00", onChange }) {
  const parts = (value || "09:00").split(":");
  const hh = parts[0] || "09";
  const rawMm = parts[1] || "00";
  const mm = MINUTES.includes(rawMm)
    ? rawMm
    : MINUTES.reduce((p, c) => Math.abs(+c - +rawMm) < Math.abs(+p - +rawMm) ? c : p);

  return (
    <View style={{
      flexDirection: "row", alignItems: "center", justifyContent: "center",
      gap: 6, backgroundColor: T.bg3, borderRadius: T.r.md, paddingVertical: 8,
    }}>
      <PickerColumn data={HOURS}   value={hh} onChange={h => onChange(`${h}:${mm}`)} />
      <Text style={{ fontSize: 26, fontWeight: "700", color: T.t2 }}>:</Text>
      <PickerColumn data={MINUTES} value={mm} onChange={m => onChange(`${hh}:${m}`)} />
    </View>
  );
}

const MOCK_SCAN_DEVICES = [
  { id: "s1", name: "Galaxy Watch 6", mac: "A3:F2:1C:44", rssi: -58 },
  { id: "s2", name: "Mi Band 8",       mac: "B1:C4:2D:88", rssi: -74 },
  { id: "s3", name: "Fitbit Charge 5", mac: "D5:E7:3A:FF", rssi: -81 },
];

function rssiToSignal(rssi) {
  if (rssi >= -65) return { label: "강함", color: T.green };
  if (rssi >= -75) return { label: "보통", color: T.amber };
  return { label: "약함", color: T.red };
}

function WearableSettings() {
  const { state } = useApp();
  const [paired, setPaired] = useState([
    { id: 1, name: "RemiWatch Pro", mac: "RC:00:00:01", battery: state.device.wearableBattery, syncedAt: "방금 전" },
  ]);
  const [scanning, setScanning] = useState(false);
  const [found, setFound] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [connectingId, setConnectingId] = useState(null);

  const startScan = () => {
    setScanning(true);
    setFound([]);
    setShowScanner(true);
    MOCK_SCAN_DEVICES.forEach((dev, i) => {
      setTimeout(() => {
        setFound(prev => prev.find(d => d.id === dev.id) ? prev : [...prev, dev]);
        if (i === MOCK_SCAN_DEVICES.length - 1) setScanning(false);
      }, (i + 1) * 1100);
    });
  };

  const connectDevice = (dev) => {
    setConnectingId(dev.id);
    setTimeout(() => {
      setPaired(prev => [...prev, {
        id: Date.now(),
        name: dev.name,
        mac: dev.mac,
        battery: Math.floor(Math.random() * 30) + 65,
        syncedAt: "방금 전",
      }]);
      setFound(prev => prev.filter(d => d.id !== dev.id));
      setConnectingId(null);
    }, 1500);
  };

  const disconnectDevice = (id) => {
    Alert.alert("연결 해제", "기기 연결을 해제할까요?", [
      { text: "취소", style: "cancel" },
      { text: "해제", style: "destructive", onPress: () => setPaired(prev => prev.filter(d => d.id !== id)) },
    ]);
  };

  return (
    <Card>
      <SectionLabel>웨어러블 기기 연동</SectionLabel>

      {/* 연결된 기기 목록 */}
      {paired.length === 0 && !showScanner ? (
        <View style={{ alignItems: "center", paddingVertical: 18 }}>
          <Text style={{ fontSize: 34, marginBottom: 8 }}>⌚</Text>
          <Text style={{ fontSize: 13, fontWeight: "600", color: T.t2 }}>연결된 기기 없음</Text>
          <Text style={{ fontSize: 11, color: T.t3, marginTop: 4 }}>아래 버튼을 눌러 기기를 스캔하세요.</Text>
        </View>
      ) : (
        <View style={{ gap: 8, marginBottom: 14 }}>
          {paired.map(d => (
            <View key={d.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: T.bg3, padding: 12, borderRadius: T.r.md, borderColor: `${T.teal}44`, borderWidth: 1 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: T.tealDim, borderColor: T.teal, borderWidth: 1.5, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 18 }}>⌚</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: T.t1 }}>{d.name}</Text>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: T.green }} />
                </View>
                <Text style={{ fontSize: 11, color: T.t3, marginTop: 2 }}>
                  {d.mac}  ·  배터리 {d.battery}%  ·  {d.syncedAt} 동기화
                </Text>
              </View>
              <TouchableOpacity onPress={() => disconnectDevice(d.id)} style={{ paddingVertical: 5, paddingHorizontal: 10, borderRadius: T.r.sm, backgroundColor: T.redDim, borderColor: `${T.red}55`, borderWidth: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: "600", color: T.red }}>해제</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* 스캐너 */}
      {showScanner && (
        <View style={{ backgroundColor: T.bg3, borderRadius: T.r.md, padding: 12, marginBottom: 12, borderColor: T.b2, borderWidth: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: scanning ? T.teal : T.t3 }} />
            <Text style={{ fontSize: 12, fontWeight: "600", color: T.t2 }}>
              {scanning ? "BLE 스캔 중..." : `스캔 완료 · 주변 기기 ${found.length}개 발견`}
            </Text>
          </View>

          {scanning && found.length === 0 && (
            <Text style={{ fontSize: 12, color: T.t3, textAlign: "center", paddingVertical: 10 }}>
              블루투스 기기를 검색하고 있습니다...
            </Text>
          )}

          {found.map((dev, i) => {
            const sig = rssiToSignal(dev.rssi);
            const isConnecting = connectingId === dev.id;
            return (
              <View key={dev.id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: T.b1 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg4, alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                  <Text style={{ fontSize: 16 }}>⌚</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: T.t1 }}>{dev.name}</Text>
                  <Text style={{ fontSize: 11, color: T.t3, marginTop: 1 }}>
                    {dev.mac}  ·  신호 <Text style={{ color: sig.color }}>{sig.label}</Text>
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => connectDevice(dev)}
                  disabled={!!connectingId}
                  style={{ paddingVertical: 6, paddingHorizontal: 14, borderRadius: T.r.sm, backgroundColor: isConnecting ? T.bg4 : T.tealDim, borderColor: isConnecting ? T.b2 : T.teal, borderWidth: 1 }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600", color: isConnecting ? T.t3 : T.teal }}>
                    {isConnecting ? "연결 중..." : "연결"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}

          {!scanning && found.length === 0 && (
            <Text style={{ fontSize: 12, color: T.t3, textAlign: "center", paddingVertical: 8 }}>
              주변에 연결 가능한 기기가 없습니다.
            </Text>
          )}
        </View>
      )}

      <Button onPress={startScan} variant={scanning ? "ghost" : "primary"}>
        {scanning ? "스캔 중..." : showScanner ? "다시 스캔" : "새 기기 스캔"}
      </Button>
    </Card>
  );
}

function AiServerSettings() {
  const { state, setAiServerUrl } = useApp();
  const [url, setUrl] = useState(state.aiServerUrl || "");
  const [status, setStatus] = useState(null); // null | "ok" | "fail" | "testing"

  const testConnection = async () => {
    if (!url.trim()) { Alert.alert("알림", "서버 주소를 입력해주세요."); return; }
    setStatus("testing");
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${url.trim()}/video/feed`, { method: "HEAD", signal: controller.signal });
      clearTimeout(timer);
      setStatus(res.ok ? "ok" : "fail");
    } catch {
      setStatus("fail");
    }
  };

  const handleSave = () => {
    setAiServerUrl(url.trim());
    Alert.alert("저장 완료", "AI 서버 주소가 저장되었습니다.");
  };

  const statusInfo = {
    ok:      { label: "연결 성공", color: T.green },
    fail:    { label: "연결 실패 — IP 또는 포트를 확인하세요", color: T.red },
    testing: { label: "연결 테스트 중...", color: T.amber },
  };

  return (
    <Card>
      <SectionLabel>AI 서버 연결</SectionLabel>
      <Text style={{ fontSize: 12, color: T.t3, marginBottom: 10, lineHeight: 18 }}>
        AI 서버가 실행 중인 PC의 IP 주소와 포트를 입력하세요.{"\n"}
        <Text style={{ color: T.t2 }}>예: http://192.168.0.10:5000</Text>
      </Text>

      <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
        <TextInput
          placeholder="http://192.168.x.x:5000"
          placeholderTextColor={T.t3}
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          keyboardType="url"
          style={{ flex: 1, backgroundColor: T.bg3, color: T.t1, padding: 10, borderRadius: T.r.sm, fontSize: 13, borderColor: T.b2, borderWidth: 1 }}
        />
        <TouchableOpacity
          onPress={testConnection}
          style={{ paddingHorizontal: 14, borderRadius: T.r.sm, backgroundColor: T.bg3, borderColor: T.b2, borderWidth: 1, justifyContent: "center" }}
        >
          <Text style={{ fontSize: 12, color: T.t2 }}>테스트</Text>
        </TouchableOpacity>
      </View>

      {status && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusInfo[status].color }} />
          <Text style={{ fontSize: 12, color: statusInfo[status].color }}>{statusInfo[status].label}</Text>
        </View>
      )}

      <View style={{ backgroundColor: T.bg3, borderRadius: T.r.sm, padding: 10, marginBottom: 12, gap: 4 }}>
        {[
          ["영상 피드", `${url || "http://..."}/video/feed`],
          ["낙상 알림", `${url || "http://..."}/api/status`],
        ].map(([label, endpoint]) => (
          <View key={label} style={{ flexDirection: "row", gap: 8 }}>
            <Text style={{ fontSize: 11, color: T.t3, width: 56 }}>{label}</Text>
            <Text style={{ fontSize: 11, color: T.t2, flex: 1 }} numberOfLines={1}>{endpoint}</Text>
          </View>
        ))}
      </View>

      <Button onPress={handleSave}>주소 저장</Button>

      {state.aiServerUrl ? (
        <Text style={{ fontSize: 11, color: T.teal, marginTop: 8, textAlign: "center" }}>
          ● 현재 저장된 주소: {state.aiServerUrl}
        </Text>
      ) : (
        <Text style={{ fontSize: 11, color: T.t3, marginTop: 8, textAlign: "center" }}>
          저장된 주소 없음 — 홈캠이 목업으로 표시됩니다.
        </Text>
      )}
    </Card>
  );
}

function ElderTabs() {
  const { state, selectElder } = useApp();
  const elders = state.elders || [];
  if (elders.length <= 1) return null;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
      {elders.map(e => {
        const active = e.id === state.selectedElderId;
        return (
          <TouchableOpacity
            key={e.id}
            onPress={() => selectElder(e.id)}
            style={{ paddingVertical: 5, paddingHorizontal: 14, borderRadius: 99, backgroundColor: active ? T.tealDim : T.bg3, borderColor: active ? T.teal : T.b2, borderWidth: 1 }}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: active ? T.teal : T.t3 }}>{e.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MedicationSettings() {
  const { meds, addMed, removeMed } = useMedication();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDays, setNewDays] = useState([...ALL_DAYS]);
  const [newTimes, setNewTimes] = useState(["09:00"]);

  const reset = () => {
    setIsAdding(false);
    setNewName("");
    setNewDays([...ALL_DAYS]);
    setNewTimes(["09:00"]);
  };

  const toggleDay = (day) =>
    setNewDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);

  const handleAdd = () => {
    if (!newName.trim()) { Alert.alert("알림", "약 이름을 입력해주세요."); return; }
    if (newDays.length === 0) { Alert.alert("알림", "복용 요일을 선택해주세요."); return; }
    addMed({
      id: Date.now(),
      name: newName.trim(),
      times: [...newTimes].sort(),
      taken: newTimes.map(() => false),
      color: T.teal,
      days: newDays,
    });
    reset();
  };

  const sortedMeds = [...meds].sort((a, b) => (a.times[0] || "").localeCompare(b.times[0] || ""));

  return (
    <Card>
      <SectionLabel action={isAdding ? "취소" : "추가"} onAction={isAdding ? reset : () => setIsAdding(true)}>
        복약 설정
      </SectionLabel>
      <ElderTabs />

      {isAdding && (
        <View style={{ backgroundColor: T.bg3, padding: 14, borderRadius: T.r.md, marginBottom: 12, borderColor: `${T.teal}66`, borderWidth: 1, gap: 12 }}>
          <TextInput
            placeholder="약 이름 (예: 혈압약)"
            placeholderTextColor={T.t3}
            value={newName}
            onChangeText={setNewName}
            style={{ backgroundColor: T.bg4, color: T.t1, padding: 10, borderRadius: T.r.sm }}
          />
          <View>
            <Text style={{ fontSize: 12, color: T.t3, marginBottom: 8 }}>복용 요일</Text>
            <DaySelector selected={newDays} onToggle={toggleDay} />
          </View>
          <View>
            <Text style={{ fontSize: 12, color: T.t3, marginBottom: 8 }}>복용 시간</Text>
            {newTimes.map((t, i) => (
              <View key={i}>
                <TimePicker
                  value={t}
                  onChange={(v) => setNewTimes(prev => prev.map((x, xi) => xi === i ? v : x))}
                />
                {newTimes.length > 1 && (
                  <TouchableOpacity
                    onPress={() => setNewTimes(prev => prev.filter((_, xi) => xi !== i))}
                    style={{ alignSelf: "flex-end", marginTop: 4, marginBottom: 8 }}
                  >
                    <Text style={{ color: T.red, fontSize: 12 }}>− 이 시간 삭제</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity
              onPress={() => setNewTimes(prev => [...prev, "09:00"])}
              style={{ alignSelf: "flex-start", marginTop: 4 }}
            >
              <Text style={{ color: T.blue, fontSize: 12, fontWeight: "600" }}>+ 시간 추가</Text>
            </TouchableOpacity>
          </View>
          <Button onPress={handleAdd}>저장하기</Button>
        </View>
      )}

      {sortedMeds.length === 0 ? (
        <EmptyState icon="💊" title="등록된 약이 없습니다" desc="우측 상단의 추가를 눌러주세요." />
      ) : (
        <View style={{ gap: 8 }}>
          {sortedMeds.map(med => {
            const dayStr = DAY_ORDER
              .filter(d => (med.days || ALL_DAYS).includes(d))
              .map(d => DAY_LABEL[d]).join(" ");
            return (
              <View key={med.id} style={{ flexDirection: "row", alignItems: "center", backgroundColor: T.bg3, padding: 12, borderRadius: T.r.md }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: med.color, marginRight: 10, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: T.t1 }}>{med.name}</Text>
                  <Text style={{ fontSize: 11, color: T.t3, marginTop: 3 }}>
                    {[...med.times].sort().join(", ")}  ·  {dayStr}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeMed(med.id)} style={{ padding: 6 }}>
                  <Text style={{ color: T.red, fontWeight: "700" }}>삭제</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}

function ScheduleSettings() {
  const { timeline, addTimelineItem, removeTimelineItem, updateTimelineItem } = useTimeline();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newLabel, setNewLabel] = useState("");
  const [newDays, setNewDays] = useState([...ALL_DAYS]);
  const [newTime, setNewTime] = useState("09:00");

  const reset = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewLabel("");
    setNewDays([...ALL_DAYS]);
    setNewTime("09:00");
  };

  const toggleDay = (day) =>
    setNewDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);

  const handleAdd = () => {
    if (!newLabel.trim()) { Alert.alert("알림", "일정 내용을 입력해주세요."); return; }
    if (newDays.length === 0) { Alert.alert("알림", "요일을 선택해주세요."); return; }
    addTimelineItem({ id: `t_${Date.now()}`, time: newTime, label: newLabel.trim(), status: "wait", note: "예정", days: newDays });
    reset();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setNewLabel(item.label);
    setNewDays(item.days || [...ALL_DAYS]);
    setNewTime(item.time);
    setIsAdding(false);
  };

  const handleUpdate = () => {
    if (!newLabel.trim()) { Alert.alert("알림", "일정 내용을 입력해주세요."); return; }
    if (newDays.length === 0) { Alert.alert("알림", "요일을 선택해주세요."); return; }
    updateTimelineItem(editingId, { label: newLabel.trim(), time: newTime, days: newDays });
    reset();
  };

  const sortedTimeline = [...timeline].sort((a, b) => a.time.localeCompare(b.time));

  const formJsx = (onSave) => (
    <View style={{ backgroundColor: T.bg3, padding: 14, borderRadius: T.r.md, marginBottom: 12, borderColor: `${T.teal}66`, borderWidth: 1, gap: 12 }}>
      <TextInput
        placeholder="일정 내용 (예: 병원 방문)"
        placeholderTextColor={T.t3}
        value={newLabel}
        onChangeText={setNewLabel}
        style={{ backgroundColor: T.bg4, color: T.t1, padding: 10, borderRadius: T.r.sm }}
      />
      <View>
        <Text style={{ fontSize: 12, color: T.t3, marginBottom: 8 }}>요일</Text>
        <DaySelector selected={newDays} onToggle={toggleDay} />
      </View>
      <View>
        <Text style={{ fontSize: 12, color: T.t3, marginBottom: 8 }}>시간</Text>
        <TimePicker value={newTime} onChange={setNewTime} />
      </View>
      <Button onPress={onSave}>저장하기</Button>
    </View>
  );

  return (
    <Card>
      <SectionLabel
        action={isAdding || editingId ? "취소" : "추가"}
        onAction={isAdding || editingId ? reset : () => setIsAdding(true)}
      >
        일정 설정
      </SectionLabel>
      <ElderTabs />

      {isAdding && formJsx(handleAdd)}

      {sortedTimeline.length === 0 ? (
        <EmptyState icon="🗓" title="등록된 일정이 없습니다" desc="우측 상단의 추가를 눌러주세요." />
      ) : (
        <View style={{ gap: 8 }}>
          {sortedTimeline.map(item => {
            const dayStr = DAY_ORDER
              .filter(d => (item.days || ALL_DAYS).includes(d))
              .map(d => DAY_LABEL[d]).join(" ");
            const isEditing = editingId === item.id;
            return (
              <View key={item.id}>
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: T.bg3, padding: 12, borderRadius: T.r.md }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: T.t1 }}>{item.label}</Text>
                    <Text style={{ fontSize: 11, color: T.t3, marginTop: 3 }}>{item.time}  ·  {dayStr}</Text>
                  </View>
                  <TouchableOpacity onPress={() => isEditing ? reset() : handleEdit(item)} style={{ padding: 6, marginRight: 4 }}>
                    <Text style={{ color: T.teal, fontWeight: "700" }}>{isEditing ? "취소" : "수정"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeTimelineItem(item.id)} style={{ padding: 6 }}>
                    <Text style={{ color: T.red, fontWeight: "700" }}>삭제</Text>
                  </TouchableOpacity>
                </View>
                {isEditing && formJsx(handleUpdate)}
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}

function ZoneSettings() {
  const handleSend = () => {
    Alert.alert("이메일 발송", "이메일이 발송됐습니다.");
  };

  return (
    <Card>
      <SectionLabel>구간 설정</SectionLabel>
      <Text style={{ fontSize: 12, color: T.t3, marginBottom: 12, lineHeight: 18 }}>
        구간 설정 링크를 이메일로 전송합니다.
      </Text>
      <Button onPress={handleSend}>구간 설정하기</Button>
    </Card>
  );
}

export default function SettingsTab() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 14, paddingHorizontal: 14, paddingBottom: 90 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", color: T.t1, marginBottom: 16, paddingHorizontal: 4 }}>
        설정
      </Text>
      <AiServerSettings />
      <WearableSettings />
      <MedicationSettings />
      <ScheduleSettings />
      <ZoneSettings />
    </ScrollView>
  );
}
