import React, { useEffect, useRef } from "react";
import { View, Text, Image, Animated, StyleSheet } from "react-native";
import { T } from "../tokens";

export default function SplashScreen({ onDone }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
        <Image
          source={require('./RemiCare.png')}
          style={styles.logo}
        />
      </Animated.View>
      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
        AI 노인 응급 보호 플랫폼
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg0,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: T.tealDim,
    borderColor: 'rgba(92,124,250,.45)',
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: T.teal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 54,
    height: 54,
    borderRadius: 12,
  },
  title: {
    fontSize: 14,
    color: T.t3,
    marginTop: 8,
  }
});
