import { useState, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { BASE_URL } from "../constants";

// 서버 어르신 → 로컬 포맷 변환
// ElderlySimpleInfoResponse: { id, name, phoneNumber, address, birthDate, gender, loginCode? }
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
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // ── 로그인 ──────────────────────────────────────────────────────
  const signIn = useCallback(async (loginId, password) => {
    if (!loginId || !password) { setError("아이디와 비밀번호를 입력하세요."); return false; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.status?.message || "로그인에 실패했습니다.");
      const user = data.results?.[0];
      if (!user) throw new Error("사용자 정보를 가져올 수 없습니다.");

      const token = user.token;
      const userId = user.userId ?? user.id;

      console.log("[LOGIN] 로그인 응답 user:", user);
      console.log("[LOGIN] 저장할 userId:", userId);

      login({
        id: userId,
        userId: userId,
        uid: String(userId),
        email: loginId,
        name: user.name,
        token,
        role: user.role,
      });

      // 담당 어르신 목록 불러오기
      if (token) {
        const headers = { Authorization: `Bearer ${token}` };
        const elderlyRes = await fetch(`${BASE_URL}/api/user/elderly`, { headers });
        if (elderlyRes.ok) {
          const elderlyData = await elderlyRes.json();
          const list = elderlyData.results ?? [];
          if (list.length > 0) {
            // 로그인 응답의 assignedElderCode로 첫 번째 어르신 loginCode 보완
            const enriched = list.map((e, i) => ({
              ...e,
              loginCode: e.loginCode || (i === 0 ? (user.assignedElderCode || "") : ""),
            }));
            setElders(enriched.map(serverElderToLocal));
          }
        }
      }
      return true;
    } catch (e) {
      setError(e.message || "로그인에 실패했습니다.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [login, setElders]);

  // ── 노인 코드 로그인 ─────────────────────────────────────────────
  const signInElder = useCallback(async (loginCode) => {
    if (!loginCode) { setError("로그인 코드를 입력하세요."); return false; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login/elder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.status?.message || "로그인에 실패했습니다.");
      const user = data.results?.[0];
      if (!user) throw new Error("사용자 정보를 가져올 수 없습니다.");
      login({ email: loginCode, name: user.name, uid: user.userId, token: user.token, role: "elder" });
      // 어르신 본인 정보를 elders에 설정 (더미 데이터 대체)
      const birthYear = user.birthDate ? parseInt(String(user.birthDate).split('-')[0]) : 0;
      setElders([{
        id:         user.userId,
        name:       user.name || "어르신",
        age:        birthYear ? Math.max(0, new Date().getFullYear() - birthYear) : 0,
        address:    user.address || "",
        conditions: [],
        loginCode:  loginCode,
        photo:      null,
      }]);
      return true;
    } catch (e) {
      setError(e.message || "로그인에 실패했습니다.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [login, setElders]);

  // ── SMS 인증번호 발송 ─────────────────────────────────────────────
  const sendSmsCode = useCallback(async (phone) => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/sms?phone=${encodeURIComponent(phone)}`);
      return res.ok;
    } catch { return false; }
  }, []);

  // ── SMS 인증번호 확인 ─────────────────────────────────────────────
  const verifySmsCode = useCallback(async (phone, code) => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/sms/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone, verificationCode: code }),
      });
      return res.ok;
    } catch { return false; }
  }, []);

  const signUp = useCallback(async (userData) => {
  setError("");
  setLoading(true);

  try {
    // 백엔드 LegacySignUpRequest에 맞춘 flat JSON 구조
    const payload = {
      // 보호자 계정 정보
      loginId: userData.loginId,
      password: userData.password,

      // 어르신 정보
      name: userData.elderName,
      phoneNumber: userData.elderPhone,
      address: userData.elderAddr,
      gender: userData.elderGender,

      // 보호자 정보
      protectorName: userData.name,
      protectorContact: userData.phone,
      protectorAddress: userData.address,
      protectorGender: userData.gender,

      // 선택값
      rrn: null,
      fcmToken: null,
      drn: null,
      role: null,
    };

    console.log("회원가입 요청 payload:", JSON.stringify(payload, null, 2));

    // 1. 보호자+어르신 통합 가입
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseText = await res.text();
    console.log("회원가입 응답 status:", res.status);
    console.log("회원가입 응답 body:", responseText);

    let data = {};
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = {};
    }

    if (!res.ok) {
      throw new Error(data.status?.message || data.detail || "회원가입에 실패했습니다.");
    }

    const elderlyLoginCode = data.results?.[0]?.elderlyLoginCode || "";

    // 2. 로그인 → 토큰 획득
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        loginId: userData.loginId,
        password: userData.password,
      }),
    });

    const loginText = await loginRes.text();
    let loginData = {};

    try {
      loginData = loginText ? JSON.parse(loginText) : {};
    } catch {
      loginData = {};
    }

    if (!loginRes.ok) {
      throw new Error(loginData.status?.message || "로그인에 실패했습니다.");
    }

    const protectorUser = loginData.results?.[0];
    const token = protectorUser?.token;
    const protectorId = protectorUser?.userId ?? protectorUser?.id;

    console.log("[SIGNUP LOGIN] 로그인 응답 user:", protectorUser);
    console.log("[SIGNUP LOGIN] 저장할 userId:", protectorId);

    // 3. 앱 로그인 처리
    login({
      id: protectorId,
      userId: protectorId,
      uid: String(protectorId),
      email: userData.loginId,
      name: userData.name,
      token,
      role: protectorUser?.role,
    });

    // 4. 담당 어르신 목록 조회
    if (token) {
      const assignedRes = await fetch(`${BASE_URL}/api/user/elderly`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (assignedRes.ok) {
        const assignedData = await assignedRes.json();
        const list = assignedData.results ?? [];

        if (list.length > 0) {
          const enriched = list.map((e, i) => ({
            ...e,
            loginCode: e.loginCode || (i === 0 ? elderlyLoginCode : ""),
          }));

          setElders(enriched.map(serverElderToLocal));
        }
      }
    }

    return { ok: true, elderlyLoginCode };
  } catch (e) {
    console.log("회원가입 요청 실패:", e);
    setError(e.message || "회원가입에 실패했습니다.");
    return { ok: false };
  } finally {
    setLoading(false);
  }
}, [login, setElders]);

  // ── 아이디 중복 확인 ─────────────────────────────────────────────
  const checkLoginId = useCallback(async (loginId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/check-duplicate?loginId=${encodeURIComponent(loginId)}`);
      if (res.ok) return "ok";
      if (res.status === 409 || res.status === 400) return "taken";
      return "error";
    } catch { return "error"; }
  }, []);

  const demoLogin = useCallback(() => {
    login({ email: "demo@remicare.com", name: "홍길동", uid: "demo-uid", token: null });
  }, [login]);

  const signOut = useCallback(() => logout(), [logout]);

  return { signIn, signInElder, signUp, signOut, demoLogin, sendSmsCode, verifySmsCode, checkLoginId, loading, error, setError };
}
