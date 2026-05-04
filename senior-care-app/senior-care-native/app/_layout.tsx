import React, { useState } from "react";
import { AppProvider, useApp } from "../src/context/AppContext";
import SplashScreen from "../src/screens/SplashScreen";
import OnboardingScreen from "../src/screens/OnboardingScreen";
import LoginScreen from "../src/screens/LoginScreen";
import SignupScreen from "../src/screens/SignupScreen";
import MainApp from "../src/screens/MainApp";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from "expo-status-bar";

function RootNavigator() {
  const { state } = useApp();
  const [screen, setScreen] = useState("splash");
  const [tab, setTab] = useState("home");

  const handleSplashDone = async () => {
    try {
      const seen = await AsyncStorage.getItem("rc_onboarded");
      setScreen(seen ? "login" : "onboarding");
    } catch (e) {
      setScreen("onboarding");
    }
  };

  const handleOnboardingDone = async () => {
    try {
      await AsyncStorage.setItem("rc_onboarded", "1");
    } catch (e) {}
    setScreen("login");
  };

  // If context says logged in, go straight to main
  if (state.isLoggedIn && screen !== "main") {
    return <MainApp tab={tab} setTab={setTab} />;
  }

  return (
    <>
      <StatusBar style="light" />
      {screen === "splash" && <SplashScreen onDone={handleSplashDone} />}
      {screen === "onboarding" && <OnboardingScreen onDone={handleOnboardingDone} />}
      {screen === "login" && (
        <LoginScreen
          onLogin={() => setScreen("main")}
          onGoSignup={() => setScreen("signup")}
        />
      )}
      {screen === "signup" && (
        <SignupScreen
          onDone={() => setScreen("main")}
          onBack={() => setScreen("login")}
        />
      )}
      {screen === "main" && <MainApp tab={tab} setTab={setTab} />}
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}
