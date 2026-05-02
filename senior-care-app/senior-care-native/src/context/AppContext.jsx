import { createContext, useContext, useReducer, useCallback } from "react";

const AppContext = createContext(null);

const initialState = {
  // Auth
  user: null,
  isLoggedIn: false,

  // Elder
  elder: {
    name: "김순자",
    age: 78,
    address: "서울 마포구",
    conditions: ["고혈압", "당뇨", "관절염"],
    photo: null,
  },

  // Vitals (real-time)
  vitals: {
    heartRate: 72,
    bloodPressure: "118/76",
    oxygen: 98.4,
    lastUpdated: new Date(),
    status: "normal", // normal | warning | danger
  },

  // Device
  device: {
    wearableBattery: 82,
    camConnected: true,
    aiActive: true,
    accuracy: 96.2,
  },

  // Notifications
  notifications: [],
  unreadCount: 2,

  // Emergency
  emergencyActive: false,

  // AI Server (local)
  aiServerUrl: "",

  // Medication
  meds: [
    { id: 1, name: "혈압약 (암로디핀 5mg)", times: ["09:00"],         taken: [true],         color: "#2DD4BF", days: ["sun","mon","tue","wed","thu","fri","sat"] },
    { id: 2, name: "혈당약 (메트포르민)",   times: ["08:00", "20:00"], taken: [true, false],  color: "#60A5FA", days: ["sun","mon","tue","wed","thu","fri","sat"] },
    { id: 3, name: "비타민D",              times: ["12:00"],          taken: [false],        color: "#FBBF24", days: ["sun","mon","tue","wed","thu","fri","sat"] },
    { id: 4, name: "오메가3",              times: ["21:00"],          taken: [false],        color: "#C084FC", days: ["sun","mon","tue","wed","thu","fri","sat"] },
  ],

  // Timeline
  timeline: [
    { id: "t1", time: "08:00", label: "기상 및 아침 산책", status: "done", note: "완료", days: ["sun","mon","tue","wed","thu","fri","sat"] },
    { id: "t2", time: "10:00", label: "복지관 문화교실",   status: "wait", note: "예정", days: ["mon","wed","fri"] },
  ],
};

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return { ...state, isLoggedIn: true, user: action.payload };
    case "LOGOUT":
      return { ...initialState };
    case "UPDATE_VITALS":
      return { ...state, vitals: { ...state.vitals, ...action.payload, lastUpdated: new Date() } };
    case "UPDATE_ELDER":
      return { ...state, elder: { ...state.elder, ...action.payload } };
    case "SET_EMERGENCY":
      return { ...state, emergencyActive: action.payload };
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case "CLEAR_NOTIFICATIONS":
      return { ...state, unreadCount: 0 };
    case "UPDATE_DEVICE":
      return { ...state, device: { ...state.device, ...action.payload } };
    case "SET_MEDS":
      return { ...state, meds: action.payload };
    case "SET_TIMELINE":
      return { ...state, timeline: action.payload };
    case "SET_AI_SERVER_URL":
      return { ...state, aiServerUrl: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const login = useCallback((userData) => {
    dispatch({ type: "LOGIN", payload: userData });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: "LOGOUT" });
  }, []);

  const updateVitals = useCallback((vitals) => {
    dispatch({ type: "UPDATE_VITALS", payload: vitals });
  }, []);

  const setEmergency = useCallback((active) => {
    dispatch({ type: "SET_EMERGENCY", payload: active });
  }, []);

  const addNotification = useCallback((notif) => {
    dispatch({ type: "ADD_NOTIFICATION", payload: { ...notif, id: Date.now(), time: new Date() } });
  }, []);

  const setMeds = useCallback((meds) => {
    dispatch({ type: "SET_MEDS", payload: meds });
  }, []);

  const setTimeline = useCallback((timeline) => {
    dispatch({ type: "SET_TIMELINE", payload: timeline });
  }, []);

  const setAiServerUrl = useCallback((url) => {
    dispatch({ type: "SET_AI_SERVER_URL", payload: url });
  }, []);

  return (
    <AppContext.Provider value={{ state, login, logout, updateVitals, setEmergency, addNotification, setMeds, setTimeline, setAiServerUrl }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
