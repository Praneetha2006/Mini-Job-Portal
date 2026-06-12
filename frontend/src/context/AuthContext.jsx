import { createContext, useContext, useState, useEffect } from "react";
import * as authApi from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);

  // Load user profile on startup if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const profile = await authApi.getMe();
          setUser(profile);
        } catch (error) {
          console.error("Token validation failed, logging out...", error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const data = await authApi.login({ email, password });
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      });
      return data;
    } catch (error) {
      console.error("Login failure:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    try {
      setLoading(true);
      const data = await authApi.register({ name, email, password, role });
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      });
      return data;
    } catch (error) {
      console.error("Registration failure:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const profile = await authApi.getMe();
        setUser(profile);
        return profile;
      } catch (error) {
        console.error("Failed to refresh user profile:", error);
      }
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
