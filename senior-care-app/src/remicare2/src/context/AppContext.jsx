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

  return (
    <AppContext.Provider value={{ state, login, logout, updateVitals, setEmergency, addNotification }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
