import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, SafeAreaView, Platform, Image } from "react-native";
import { T } from "../tokens";
import { useEmergency } from "../hooks/useEmergency";
import { useApp } from "../context/AppContext";
import { useNotificationListener } from "../hooks/useFcmToken";
import HomeTab from "./HomeTab";
import InsightsTab from "./InsightsTab";
import SettingsTab from "./SettingsTab";
import { ProfileTab } from "./CareAndProfile";

const TABS = [
  { id: "home", icon: "⌂", label: "홈" },
  { id: "insight", icon: "↗", label: "인사이트" },
  { id: "settings", icon: "⊕", label: "설정" },
  { id: "profile", icon: "◉", label: "내 정보" },
];

function EmergencyModal({ status, onClose }) {
  return (
    <Modal transparent animationType="fade" visible={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalIconContainer}>
            <View style={styles.modalSpinner} />
            <Text style={styles.modalIcon}>📞</Text>
          </View>
          <Text style={styles.modalTitle}>
            {status === "connecting" ? "비상 통화 연결 중..." : "통화 연결됨"}
          </Text>
          <Text style={styles.modalDesc}>
            {status === "connecting"
              ? "홈캠 · 스피 권한을 요청 중입니다.\n잠시 후 양방향 통화가 시작됩니다."
              : "어머니와 양방향 통화 중입니다.\n마이크 아이콘을 눌러 음소거하세요."}
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseTxt}>종료</Text>
            </TouchableOpacity>
            {status === "connected" && (
              <TouchableOpacity style={styles.modalMuteBtn}>
                <Text style={styles.modalMuteTxt}>🔇 음소거</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function MainApp({ tab, setTab }) {
  const { state } = useApp();
  const { callOpen, callStatus, openCall, closeCall } = useEmergency();
  useNotificationListener();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoIcon}>
            <Image source={require('./RemiCare.png')} style={{ width: 26, height: 26, borderRadius: 7 }} />
          </View>
          <View>
            <Text style={styles.headerTitle}>RemiCare</Text>
            {state.user?.role === "elder" ? (
              <Text style={styles.headerSubtitle}>
                안녕하세요, {state.user.name}님 · <Text style={{ color: T.green }}>● 연결됨</Text>
              </Text>
            ) : (
              <Text style={styles.headerSubtitle}>
                {state.elder.name} · {state.elder.address} · <Text style={{ color: T.green }}>● 연결됨</Text>
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={openCall} style={styles.emergencyBtn}>
          <View style={styles.emergencyDot} />
          <Text style={styles.emergencyTxt}>비상 통화</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {tab === "home" && <HomeTab />}
        {tab === "insight" && <InsightsTab />}
        {tab === "settings" && <SettingsTab />}
        {tab === "profile" && <ProfileTab />}
      </View>

      <View style={styles.tabBar}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <TouchableOpacity key={t.id} onPress={() => setTab(t.id)} style={styles.tabItem}>
              <View style={[styles.tabIconWrapper, active && { backgroundColor: T.tealDim }]}>
                <Text style={[styles.tabIcon, { color: active ? T.teal : T.t3 }]}>{t.icon}</Text>
              </View>
              <Text style={[styles.tabLabel, { color: active ? T.teal : T.t3, fontWeight: active ? "700" : "400" }]}>{t.label}</Text>
              {active && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {callOpen && <EmergencyModal status={callStatus} onClose={closeCall} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg1,
  },
  header: {
    backgroundColor: T.bg0,
    borderBottomColor: T.b1,
    borderBottomWidth: 1,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 30 : 14,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: T.tealDim,
    borderColor: `${T.teal}44`,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: T.t1,
  },
  headerSubtitle: {
    fontSize: 11,
    color: T.t3,
  },
  emergencyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: T.redDim,
    borderColor: `${T.red}55`,
    borderWidth: 1,
    borderRadius: 99,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  emergencyDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: T.red,
  },
  emergencyTxt: {
    color: T.red,
    fontSize: 12,
    fontWeight: "700",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: T.bg0,
    borderTopColor: T.b1,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 8,
    gap: 4,
  },
  tabIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIcon: {
    fontSize: 14,
  },
  tabLabel: {
    fontSize: 10,
  },
  activeIndicator: {
    width: 16,
    height: 2,
    backgroundColor: T.teal,
    borderRadius: 99,
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: T.bg2,
    borderRadius: T.r.xl,
    paddingVertical: 32,
    paddingHorizontal: 24,
    width: 320,
    alignItems: "center",
    borderColor: T.redDim,
    borderWidth: 1,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    marginBottom: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSpinner: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    borderColor: T.red,
    borderWidth: 3,
    borderTopColor: "transparent",
  },
  modalIcon: {
    fontSize: 24,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: T.t1,
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 13,
    color: T.t3,
    marginBottom: 22,
    lineHeight: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  modalCloseBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: T.r.md,
    backgroundColor: T.bg4,
    borderColor: T.b2,
    borderWidth: 1,
    alignItems: "center",
  },
  modalCloseTxt: {
    color: T.t2,
    fontSize: 13,
    fontWeight: "600",
  },
  modalMuteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: T.r.md,
    backgroundColor: T.tealDim,
    borderColor: `${T.teal}55`,
    borderWidth: 1,
    alignItems: "center",
  },
  modalMuteTxt: {
    color: T.teal,
    fontSize: 13,
    fontWeight: "600",
  }
});
