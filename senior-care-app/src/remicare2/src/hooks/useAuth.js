import { useState, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { BASE_URL } from "../constants";

export function useAuth() {
  const { login, logout } = useApp();
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState("");

  const signIn = useCallback(async (email, password) => {
    if (!email || !password) { setError("이메일과 비밀번호를 입력하세요."); return false; }
    setError(""); setLoading(true);
    
    console.log("=== [DEBUG] 로그인 시도 시작 ===");
    console.log("URL:", `${BASE_URL}/api/auth/login`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId: email, password: password })
      });

      console.log("=== [DEBUG] 서버 응답 수신 ===");
      console.log("Status:", response.status);

      const data = await response.json();
      console.log("Response Data:", data);

      if (!response.ok) {
        throw new Error(data.status?.message || "로그인에 실패했습니다.");
      }

      const userResult = data.results && data.results[0];
      if (!userResult) {
        throw new Error("사용자 정보를 가져올 수 없습니다.");
      }

      login({ 
        email: email, 
        name: userResult.name, 
        uid: userResult.userId,
        token: userResult.token 
      });
      return true;
    } catch (e) {
      console.error("=== [DEBUG] 통신 에러 발생 ===");
      console.error(e);
      setError(e.message || "로그인에 실패했습니다. 다시 시도해주세요.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [login]);

  const signUp = useCallback(async (userData) => {
    setError(""); setLoading(true);
    try {
      const ageStr = userData.elderAge ? String(userData.elderAge).trim() : "";
      const age = parseInt(ageStr) || 70;
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - age;
      const birthDate = `${birthYear}/01/01`;

      const requestData = {
        name: userData.elderName,           
        loginId: userData.email,            
        email: userData.email,
        password: userData.password,
        phoneNumber: userData.phone,        
        address: userData.elderAddr,
        protectorName: userData.name,       
        protectorContact: userData.phone,   
        rrn: "000101-4000000",
        birthDate: birthDate,
        gender: "남",
        fcmToken: "dummy_fcm_token_for_now",
        drn: "NONE",
        role: "USER"
      };

      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      });

      let data = {};
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error("JSON 파싱 에러:", e);
        }
      }

      if (!response.ok) {
        throw new Error(data.status?.message || "회원가입에 실패했습니다.");
      }

      login({ email: userData.email, name: userData.name, uid: "new-user" });
      return true;
    } catch (e) {
      setError(e.message || "회원가입에 실패했습니다.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [login]);

  const signOut = useCallback(() => {
    logout();
  }, [logout]);

  return { signIn, signUp, signOut, loading, error, setError };
}
