import { useState, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { BASE_URL } from "../constants";

// 서버 어르신 → 로컬 포맷 변환
function serverElderToLocal(e) {
  const birthYear = e.birthDate ? parseInt(String(e.birthDate).split('-')[0]) : 0;
  const age = birthYear ? Math.max(0, new Date().getFullYear() - birthYear) : 0;
  return {
    id:         e.id,
    name:       e.name || "어르신",
    age,
    address:    e.address || "",
    conditions: e.conditions || [],
    loginCode:  e.loginCode || "",
    photo:      null,
  };
}

export function useAuth() {
  const { login, logout, setElders } = useApp();
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
        throw new Error(data.status?.message || "로그인에 실패했습니다.");
      }

      const userResult = data.results && data.results[0];
      if (!userResult) {
        throw new Error("사용자 정보를 가져올 수 없습니다.");
      }

      const token = userResult.token;
      login({ 
        email: email, 
        name: userResult.name, 
        uid: userResult.userId,
        token: token 
      });

      // 담당 어르신 목록 가져오기 (백엔드 경로: /api/user/elderly)
      if (token) {
        const elderlyRes = await fetch(`${BASE_URL}/api/user/elderly`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (elderlyRes.ok) {
          const elderlyData = await elderlyRes.json();
          // 백엔드 ApiResponse 구조(results)에 맞게 처리
          if (elderlyData.results && elderlyData.results.length > 0) {
            const list = elderlyData.results;
            const enriched = list.map((e, i) => ({
              ...e,
              loginCode: e.loginCode || (i === 0 ? (userResult.assignedElderCode || "") : ""),
            }));
            setElders(enriched.map(serverElderToLocal));
          }
        }
      }

      return true;
    } catch (e) {
      setError(e.message || "로그인에 실패했습니다. 다시 시도해주세요.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [login, setElders]);

  const signUp = useCallback(async (userData) => {
    setError(""); setLoading(true);
    try {
      const elderLoginId = `elder${(userData.elderName || "user").replace(/\s/g, "")}${Date.now().toString().slice(-4)}`;
      const elderPhone = userData.elderPhone || `01099${Date.now().toString().slice(-6)}`;

      const res = await fetch(`${BASE_URL}/api/auth/signup/combined`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          protector: {
            name:        userData.name,
            loginId:     userData.email,
            email:       userData.email,
            password:    userData.password,
            phoneNumber: userData.phone,
            address:     userData.elderAddr || "서울",
            rrn:         "000101-4000000",
            birthDate:   "1980/01/01",
            gender:      "남",
            fcmToken:    "dummy_fcm_token",
          },
          elderly: {
            name:             userData.elderName,
            loginId:          elderLoginId,
            email:            null,
            password:         "Elder12345678",
            phoneNumber:      elderPhone,
            address:          userData.elderAddr,
            rrn:              "000101-4000000",
            drn:              null,
            protectorName:    userData.name,
            protectorContact: userData.phone,
            protectorId:      null,
            birthDate:        "1950/01/01",
            gender:           "남",
            fcmToken:         "dummy_fcm_token",
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.status?.message || "회원가입에 실패했습니다.");

      // 자동 로그인 처리
      await signIn(userData.email, userData.password);
      return true;
    } catch (e) {
      setError(e.message || "회원가입에 실패했습니다.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [signIn]);

  const signOut = useCallback(() => {
    logout();
  }, [logout]);

  return { signIn, signUp, signOut, loading, error, setError };
}
