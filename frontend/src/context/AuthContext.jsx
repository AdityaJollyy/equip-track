import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check active session on initial load
  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await api.get("/auth/me");
        setAdmin(response.data.data);
      } catch (error) {
        if (error?.response?.status !== 401) {
          console.error("Session verification failed:", error);
        }
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };
    verifySession();
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    // The backend returns { admin, accessToken } inside data
    setAdmin(response.data.data.admin);
    return response.data;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
