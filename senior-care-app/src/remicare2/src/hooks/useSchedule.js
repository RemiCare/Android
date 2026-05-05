import { useState, useEffect, useCallback } from "react";
import { BASE_URL } from "../constants";
import { useApp } from "../context/AppContext";

export function useSchedule() {
  const { state } = useApp();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSchedules = useCallback(async () => {
    if (!state.isLoggedIn || !state.user?.token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/schedule`, {
        headers: {
          "Authorization": `Bearer ${state.user.token}`
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.status?.message || "일정을 불러오는데 실패했습니다.");
      }
      
      // 백엔드 ScheduleResponse는 results 리스트에 담겨 있음
      setSchedules(data.results || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [state.isLoggedIn, state.user?.token]);

  const addSchedule = async (title, time) => {
    try {
      const response = await fetch(`${BASE_URL}/api/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${state.user.token}`
        },
        body: JSON.stringify({ title, time })
      });
      if (response.ok) {
        fetchSchedules();
        return true;
      }
    } catch (e) {
      setError("일정 추가에 실패했습니다.");
    }
    return false;
  };

  const toggleSchedule = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/api/schedule/${id}/toggle`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${state.user.token}`
        }
      });
      if (response.ok) {
        fetchSchedules();
      }
    } catch (e) {
      setError("상태 변경에 실패했습니다.");
    }
  };

  const removeSchedule = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/api/schedule/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${state.user.token}`
        }
      });
      if (response.ok) {
        fetchSchedules();
      }
    } catch (e) {
      setError("삭제에 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return { schedules, loading, error, addSchedule, toggleSchedule, removeSchedule, refresh: fetchSchedules };
}
