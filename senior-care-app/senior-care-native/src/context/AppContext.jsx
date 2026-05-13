import { createContext, useContext, useReducer, useCallback } from "react";

const AppContext = createContext(null);

const INITIAL_ELDERS = [
  { id: 1, name: "김순자", age: 78, address: "서울 마포구", conditions: ["고혈압", "당뇨", "관절염"], photo: null },
];

const DEFAULT_MEDS = [
  { id: 1, name: "혈압약 (암로디핀 5mg)", times: ["09:00"],         taken: [true],         color: "#2DD4BF", days: ["sun","mon","tue","wed","thu","fri","sat"] },
  { id: 2, name: "혈당약 (메트포르민)",   times: ["08:00", "20:00"], taken: [true, false],  color: "#60A5FA", days: ["sun","mon","tue","wed","thu","fri","sat"] },
  { id: 3, name: "비타민D",              times: ["12:00"],          taken: [false],        color: "#FBBF24", days: ["sun","mon","tue","wed","thu","fri","sat"] },
  { id: 4, name: "오메가3",              times: ["21:00"],          taken: [false],        color: "#C084FC", days: ["sun","mon","tue","wed","thu","fri","sat"] },
];

const DEFAULT_TIMELINE = [
  { id: "t1", time: "08:00", label: "기상 및 아침 산책", status: "done", note: "완료", days: ["sun","mon","tue","wed","thu","fri","sat"] },
  { id: "t2", time: "10:00", label: "복지관 문화교실",   status: "wait", note: "예정", days: ["mon","wed","fri"] },
];

const initialState = {
  user: null,
  isLoggedIn: false,

  elders: INITIAL_ELDERS,
  selectedElderId: 1,
  elder: INITIAL_ELDERS[0],

  allMeds: { 1: DEFAULT_MEDS },
  timelines: { 1: DEFAULT_TIMELINE },

  vitals: {
    heartRate: 72,
    bloodPressure: "118/76",
    oxygen: 98.4,
    lastUpdated: new Date(),
    status: "normal",
  },

  device: {
    wearableBattery: 82,
    camConnected: true,
    aiActive: true,
    accuracy: 96.2,
  },

  notifications: [],
  unreadCount: 2,
  emergencyActive: false,
  aiServerUrl: "",
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
    case "SET_MEDS": {
      const eid = action.elderId ?? state.selectedElderId;
      return { ...state, allMeds: { ...state.allMeds, [eid]: action.payload } };
    }
    case "SET_TIMELINE": {
      const eid = action.elderId ?? state.selectedElderId;
      return { ...state, timelines: { ...state.timelines, [eid]: action.payload } };
    }
    case "SET_AI_SERVER_URL":
      return { ...state, aiServerUrl: action.payload };
    case "ADD_ELDER": {
      const newElder = action.payload;
      return {
        ...state,
        elders: [...state.elders, newElder],
        allMeds: { ...state.allMeds, [newElder.id]: [] },
        timelines: { ...state.timelines, [newElder.id]: [] },
      };
    }
    case "SELECT_ELDER": {
      const selected = state.elders.find(e => e.id === action.payload);
      return { ...state, selectedElderId: action.payload, elder: selected || state.elder };
    }
    case "REMOVE_ELDER": {
      const remaining = state.elders.filter(e => e.id !== action.payload);
      const newSelectedId = state.selectedElderId === action.payload
        ? (remaining[0]?.id ?? null)
        : state.selectedElderId;
      const newElder = remaining.find(e => e.id === newSelectedId) || remaining[0] || null;
      return { ...state, elders: remaining, selectedElderId: newSelectedId, elder: newElder };
    }
    case "SET_ELDERS": {
      const elders = action.payload;
      if (!elders.length) return state;
      const keepId = elders.find(e => e.id === state.selectedElderId)
        ? state.selectedElderId
        : elders[0].id;
      const allMeds = {};
      const timelines = {};
      elders.forEach(e => {
        allMeds[e.id]    = state.allMeds[e.id]    || [];
        timelines[e.id]  = state.timelines[e.id]  || [];
      });
      return {
        ...state,
        elders,
        selectedElderId: keepId,
        elder: elders.find(e => e.id === keepId) || elders[0],
        allMeds,
        timelines,
      };
    }
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
    dispatch({ type: "SET_MEDS", elderId: state.selectedElderId, payload: meds });
  }, [state.selectedElderId]);

  const setTimeline = useCallback((timeline) => {
    dispatch({ type: "SET_TIMELINE", elderId: state.selectedElderId, payload: timeline });
  }, [state.selectedElderId]);

  const setAiServerUrl = useCallback((url) => {
    dispatch({ type: "SET_AI_SERVER_URL", payload: url });
  }, []);

  const addElder = useCallback((elderData) => {
    const newElder = { id: Date.now(), ...elderData };
    dispatch({ type: "ADD_ELDER", payload: newElder });
  }, []);

  const selectElder = useCallback((elderId) => {
    dispatch({ type: "SELECT_ELDER", payload: elderId });
  }, []);

  const removeElder = useCallback((elderId) => {
    dispatch({ type: "REMOVE_ELDER", payload: elderId });
  }, []);

  const setElders = useCallback((elders) => {
    dispatch({ type: "SET_ELDERS", payload: elders });
  }, []);

  const stateWithComputed = {
    ...state,
    meds: state.allMeds[state.selectedElderId] || [],
    timeline: state.timelines[state.selectedElderId] || [],
  };

  return (
    <AppContext.Provider value={{ state: stateWithComputed, login, logout, updateVitals, setEmergency, addNotification, setMeds, setTimeline, setAiServerUrl, addElder, selectElder, removeElder, setElders }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
