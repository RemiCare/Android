import { useState, useCallback } from "react";
import { useApp } from "../context/AppContext";

export function useAuth() {
  const { login, logout } = useApp();
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState("");

  const signIn = useCallback(async (email, password) => {
    if (!email || !password) { setError("이메일과 비밀번호를 입력하세요."); return false; }
    setError(""); setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      login({ email, name: "홍길동", uid: "demo-uid" });
      return true;
    } catch (e) {
      setError("로그인에 실패했습니다. 다시 시도해주세요.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [login]);

  const signUp = useCallback(async (userData) => {
    setError(""); setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1400));
      login({ email: userData.email, name: userData.name, uid: "new-uid" });
      return true;
    } catch (e) {
      setError("회원가입에 실패했습니다.");
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
