import { createContext, useContext, useReducer, useCallback } from "react";

const AppContext = createContext(null);

const INITIAL_ELDERS = [
  { id: 1, name: "김순자", age: 78, address: "서울 마포구", conditions: ["고혈압", "당뇨", "관절염"], photo: null },
];

const initialState = {
  user: null,
  isLoggedIn: false,

  elders: INITIAL_ELDERS,
  selectedElderId: 1,
  elder: INITIAL_ELDERS[0],

  timelines: { 1: [] },

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
  aiServerUrl: "", // Added for camera integration
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
    case "SET_TIMELINE": {
      const elderId = action.elderId ?? state.selectedElderId;
      return { ...state, timelines: { ...state.timelines, [elderId]: action.payload } };
    }
    case "SET_ELDERS": {
      const elders = action.payload;
      const selectedId = elders[0]?.id ?? null;
      const timelines = { ...state.timelines };
      elders.forEach(e => { if (!timelines[e.id]) timelines[e.id] = []; });
      return { ...state, elders, selectedElderId: selectedId, elder: elders[0] || null, timelines };
    }
    case "ADD_ELDER": {
      const newElder = action.payload;
      return {
        ...state,
        elders: [...state.elders, newElder],
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

  const setTimeline = useCallback((newTimeline) => {
    dispatch({ type: "SET_TIMELINE", elderId: state.selectedElderId, payload: newTimeline });
  }, [state.selectedElderId]);

  const addElder = useCallback((elderData) => {
    const newElder = { id: Date.now(), ...elderData };
    dispatch({ type: "ADD_ELDER", payload: newElder });
    return newElder;
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

  const setAiServerUrl = useCallback((url) => {
    dispatch({ type: "SET_AI_SERVER_URL", payload: url });
  }, []);

  const stateWithTimeline = {
    ...state,
    timeline: state.timelines[state.selectedElderId] || [],
  };

  return (
    <AppContext.Provider value={{
      state: stateWithTimeline,
      login, logout, updateVitals, setEmergency, addNotification,
      setTimeline, addElder, selectElder, removeElder, setElders, setAiServerUrl,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
