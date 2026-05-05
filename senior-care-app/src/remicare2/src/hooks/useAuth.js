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
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId: email, password: password })
      });

      const data = await response.json();

      if (!response.ok) {
        // 백엔드 에러 메시지는 data.status.message에 담겨 있음
        throw new Error(data.status?.message || "로그인에 실패했습니다.");
      }

      // 백엔드 성공 응답은 data.results[0]에 담겨 있음
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
      setError(e.message || "로그인에 실패했습니다. 다시 시도해주세요.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [login]);

  const signUp = useCallback(async (userData) => {
    setError(""); setLoading(true);
    try {
      // 어르신 나이를 기반으로 생년월일 대략 계산
      const ageStr = userData.elderAge ? String(userData.elderAge).trim() : "";
      const age = parseInt(ageStr) || 70; // 입력이 없으면 기본 70세
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - age;
      const birthDate = `${birthYear}/01/01`; // 백엔드 형식: yyyy/MM/dd

      const requestData = {
        name: userData.elderName,           
        loginId: userData.email,            
        email: userData.email,
        password: userData.password,
        phoneNumber: userData.phone,        
        address: userData.elderAddr,
        protectorName: userData.name,       
        protectorContact: userData.phone,   
        rrn: "000101-4000000",              // 필수값 (규격 준수)
        birthDate: birthDate,
        gender: "남",                        // 백엔드: '남' 또는 '여'
        fcmToken: "dummy_fcm_token_for_now", // 필수값
        drn: "NONE",                        // DB의 NOT NULL 제약조건을 피하기 위한 임시 값
        role: "USER"
      };

      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      });

      let data = {};
      const text = await response.text(); // 먼저 텍스트로 읽음
      if (text) {
        try {
          data = JSON.parse(text); // 내용이 있으면 JSON으로 변환
        } catch (e) {
          console.error("JSON 파싱 에러:", e);
        }
      }

      if (!response.ok) {
        throw new Error(data.status?.message || "회원가입에 실패했습니다.");
      }

      // 회원가입 성공 후 바로 로그인 처리 (임시)
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
