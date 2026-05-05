import { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { GLOBAL_CSS }          from "./tokens";
import SplashScreen     from "./screens/SplashScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import LoginScreen      from "./screens/LoginScreen";
import SignupScreen     from "./screens/SignupScreen";
import MainApp          from "./screens/MainApp";

/*
  SCREEN FLOW:
  splash → (first time) onboarding → login ⇄ signup → main
*/

function RootNavigator() {
  const { state } = useApp();
  const [screen, setScreen] = useState("splash");
  const [tab,    setTab]    = useState("home");

  const handleSplashDone = () => {
    const seen = localStorage.getItem("rc_onboarded");
    setScreen(seen ? "login" : "onboarding");
  };

  const handleOnboardingDone = () => {
    localStorage.setItem("rc_onboarded", "1");
    setScreen("login");
  };

  // If context says logged in, go straight to main
  if (state.isLoggedIn && screen !== "main") {
    return <MainApp tab={tab} setTab={setTab} />;
  }

  return (
    <>
      {screen === "splash"     && <SplashScreen     onDone={handleSplashDone} />}
      {screen === "onboarding" && <OnboardingScreen onDone={handleOnboardingDone} />}
      {screen === "login"      && (
        <LoginScreen
          onLogin={() => setScreen("main")}
          onGoSignup={() => setScreen("signup")}
        />
      )}
      {screen === "signup"     && (
        <SignupScreen
          onDone={() => setScreen("main")}
          onBack={() => setScreen("login")}
        />
      )}
      {screen === "main"       && <MainApp tab={tab} setTab={setTab} />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <style>{GLOBAL_CSS}</style>
      <div style={{ maxWidth: 420, margin: "0 auto", minHeight: "100vh" }}>
        <RootNavigator />
      </div>
    </AppProvider>
  );
}
