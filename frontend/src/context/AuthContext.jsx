import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const AuthContext = createContext({
  logout: () => {},
  login: () => {},
  register: () => {},
  updateUser: () => {},
  loading: Boolean,
  user: [] | null,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);

  // Schedule access token refresh before expiry (every 12 minutes)
  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(
      async () => {
        try {
          const res = await api.post("/api/auth/refresh");
          setUser(res.data.user);
          scheduleRefresh();
        } catch {
          setUser(null);
        }
      },
      12 * 60 * 1000,
    );
  }, []);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/api/auth/me");
        setUser(res.data.user);
        scheduleRefresh();
      } catch {
        // Try refresh token
        try {
          const res = await api.post("/api/auth/refresh");
          setUser(res.data.user);
          scheduleRefresh();
        } catch {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [scheduleRefresh]);

  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    setUser(res.data.user);
    scheduleRefresh();
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post("/api/auth/register", { name, email, password });
    setUser(res.data.user);
    scheduleRefresh();
    return res.data;
  };

  const logout = async () => {
    await api.post("/api/auth/logout");
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    setUser(null);
    toast.success("Logged out successfully");
  };

  const updateUser = (updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
