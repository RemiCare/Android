import { useState, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { BASE_URL } from "../constants";

export function useAuth() {
  const { login, logout } = useApp();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const signIn = useCallback(async (email, password) => {
    if (!email || !password) { setError("아이디와 비밀번호를 입력하세요."); return false; }
    setError(""); setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId: email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.status?.message || "로그인에 실패했습니다.");
      const user = data.results?.[0];
      if (!user) throw new Error("사용자 정보를 가져올 수 없습니다.");
      login({ email, name: user.name, uid: user.userId, token: user.token });
      return true;
    } catch (e) {
      setError(e.message || "로그인에 실패했습니다. 다시 시도해주세요.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [login]);

  const signUp = useCallback(async (userData) => {
    setError(""); setLoading(true);
    try {
      const age = parseInt(userData.elderAge) || 70;
      const birthYear = new Date().getFullYear() - age;
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userData.elderName,
          loginId: userData.email,
          email: userData.email,
          password: userData.password,
          phoneNumber: userData.phone,
          address: userData.elderAddr,
          protectorName: userData.name,
          protectorContact: userData.phone,
          rrn: "000101-4000000",
          birthDate: `${birthYear}/01/01`,
          gender: "남",
          fcmToken: "dummy_fcm_token_for_now",
          drn: "NONE",
          role: "USER",
        }),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      if (!response.ok) throw new Error(data.status?.message || "회원가입에 실패했습니다.");
      login({ email: userData.email, name: userData.name, uid: "new-user" });
      return true;
    } catch (e) {
      setError(e.message || "회원가입에 실패했습니다.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [login]);

  const demoLogin = useCallback(() => {
    login({ email: "demo@remicare.com", name: "홍길동", uid: "demo-uid", token: null });
  }, [login]);

  const signOut = useCallback(() => logout(), [logout]);

  return { signIn, signUp, signOut, demoLogin, loading, error, setError };
}
