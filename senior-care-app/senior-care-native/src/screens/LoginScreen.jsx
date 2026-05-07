import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { T } from "../tokens";
import { Input, Button } from "../components/UI";
import { useAuth } from "../hooks/useAuth";

export default function LoginScreen({ onLogin, onGoSignup }) {
  const [email,  setEmail]  = useState("");
  const [pw,     setPw]     = useState("");
  const [showPw, setShowPw] = useState(false);
  const { signIn, demoLogin, loading, error, setError } = useAuth();

  const handleLogin = async () => {
    const ok = await signIn(email, pw);
    if (ok) onLogin();
  };

  const handleDemo = () => {
    demoLogin();
    onLogin();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.topSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require('./RemiCare.png')}
                style={styles.logo}
              />
            </View>
            <Text style={styles.subtitle}>RemiCare에 로그인하세요</Text>
          </View>

          <View style={styles.bottomSection}>
            <Input
              label="아이디"
              placeholder="로그인 아이디 입력"
              value={email}
              onChangeText={text => { setEmail(text); setError(""); }}
              autoCapitalize="none"
            />
            <Input
              label="비밀번호"
              secureTextEntry={!showPw}
              placeholder="••••••••"
              value={pw}
              onChangeText={text => { setPw(text); setError(""); }}
              rightEl={
                <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                  <Text style={{ color: T.t3, fontSize: 12, fontWeight: "600" }}>
                    {showPw ? "숨기기" : "보기"}
                  </Text>
                </TouchableOpacity>
              }
            />

            <TouchableOpacity style={{ alignSelf: "flex-end", marginTop: -6, marginBottom: 20 }}>
              <Text style={{ color: T.teal, fontSize: 12, fontWeight: "600" }}>비밀번호를 잊으셨나요?</Text>
            </TouchableOpacity>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button onPress={handleLogin} loading={loading}>로그인</Button>

            <TouchableOpacity onPress={handleDemo} style={{ marginTop: 12, paddingVertical: 12, borderRadius: T.r.md, borderColor: T.b2, borderWidth: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 13, color: T.t3, fontWeight: "600" }}>데모로 시작하기</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>또는</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialContainer}>
              {["Apple", "Google"].map((name) => (
                <TouchableOpacity key={name} style={styles.socialButton}>
                  <Text style={styles.socialButtonText}>{name}로 계속</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.signupPrompt}>
              <Text style={{ fontSize: 13, color: T.t3 }}>계정이 없으신가요? </Text>
              <TouchableOpacity onPress={onGoSignup}>
                <Text style={{ color: T.teal, fontWeight: "700", fontSize: 13 }}>회원가입</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  topSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    paddingHorizontal: 28,
    paddingBottom: 20,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: T.tealDim,
    borderColor: 'rgba(92,124,250,.4)',
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logo: {
    width: 54,
    height: 54,
    borderRadius: 12,
  },
  subtitle: {
    fontSize: 14,
    color: T.t3,
  },
  bottomSection: {
    backgroundColor: T.bg1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderColor: T.b1,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },
  errorBox: {
    backgroundColor: T.redDim,
    borderColor: 'rgba(248,113,113,.3)',
    borderWidth: 1,
    borderRadius: T.r.sm,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: T.red,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: T.b1,
  },
  dividerText: {
    fontSize: 12,
    color: T.t3,
  },
  socialContainer: {
    flexDirection: "row",
    gap: 10,
  },
  socialButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: T.r.md,
    backgroundColor: T.bg3,
    borderColor: T.b2,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  socialButtonText: {
    color: T.t2,
    fontSize: 13,
    fontWeight: "600",
  },
  signupPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 28,
  }
});
