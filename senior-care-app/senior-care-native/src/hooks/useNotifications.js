import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { BASE_URL } from "../constants";

export function useNotifications() {
  const { state } = useApp();
  const elderId = state.elder?.id;
  const token = state.user?.token;
  const isLoggedIn = state.isLoggedIn;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch_ = useCallback(async () => {
    if (!isLoggedIn || !token || !elderId) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/alert/${elderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.results || []);
    } catch {} finally {
      setLoading(false);
    }
  }, [isLoggedIn, token, elderId]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { notifications, loading, refresh: fetch_ };
}
