import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView } from "react-native";
import { T } from "../tokens";
import { Button } from "../components/UI";

const SLIDES = [
  { emoji:"🌿", title:"24시간\n안심 모니터링", desc:"웨어러블과 홈캠이 협력하여\n어르신의 응급 상황을 실시간으로 감지합니다.", color:T.teal, dim:T.tealDim },
  { emoji:"🤖", title:"AI가\n직접 브리핑",    desc:"단순 알림이 아닌, 상황의 원인과 근거를\n자연어로 설명해 드립니다.",             color:T.blue, dim:T.blueDim },
  { emoji:"💊", title:"복약·식사\n자동 체크",  desc:"AI가 웨어러블 데이터로 복약과 식사를\n자동으로 확인해 알려드립니다.",          color:T.green, dim:T.greenDim },
  { emoji:"🚑", title:"즉각적인\n돌봄 연계",   desc:"비응급 상황에도 요양보호사를\n즉시 연결해 드립니다.",                         color:T.amber, dim:T.amberDim },
];

export default function OnboardingScreen({ onDone }) {
  const [idx, setIdx] = useState(0);
  const slide = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bg0 }]}>
      <View style={styles.header}>
        {!isLast && (
          <TouchableOpacity onPress={onDone} style={{ padding: 10 }}>
            <Text style={{ color: T.t3, fontSize: 13, fontWeight: "600" }}>건너뛰기</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.logoWrapper}>
          <View style={[styles.logoContainer, { backgroundColor: slide.dim, borderColor: `${slide.color}55` }]}>
            <Image 
              source={require('./RemiCare.png')} 
              style={styles.logo} 
            />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.desc}>{slide.desc}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setIdx(i)}>
              <View style={[
                styles.dot, 
                { 
                  width: i === idx ? 24 : 6, 
                  backgroundColor: i === idx ? slide.color : T.b2 
                }
              ]} />
            </TouchableOpacity>
          ))}
        </View>
        <Button 
          onPress={() => isLast ? onDone() : setIdx(i => i + 1)}
          style={{ backgroundColor: slide.color }}
        >
          {isLast ? "시작하기 →" : "다음"}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 20,
    height: 50,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoWrapper: {
    marginBottom: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 54,
    height: 54,
    borderRadius: 12,
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: T.t1,
    lineHeight: 36,
    textAlign: "center",
    marginBottom: 16,
  },
  desc: {
    fontSize: 15,
    color: T.t2,
    lineHeight: 24,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: 28,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  }
});
