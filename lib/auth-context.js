"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const refreshUser = async () => {
    try {
      const token = api.getToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return null;
      }
      const data = await api.getMe();
      if (data.success && data.user) {
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      console.warn("Failed to restore session:", err.message);
      api.setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
    return null;
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email, password) => {
    setAuthError("");
    try {
      const data = await api.login(email, password);
      if (data.token) {
        api.setToken(data.token);
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      setAuthError(err.message || "Login failed");
      throw err;
    }
  };

  const register = async (userData) => {
    setAuthError("");
    try {
      const data = await api.register(userData);
      if (data.token) {
        api.setToken(data.token);
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      setAuthError(err.message || "Registration failed");
      throw err;
    }
  };

  const loginWithGithubOAuth = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/api/v1/auth/github";
    }
  };

  const handleOAuthToken = async (token) => {
    if (token) {
      api.setToken(token);
      return await refreshUser();
    }
    return null;
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const updateAvatar = (newUrl) => {
    if (user) {
      setUser({ ...user, avatar: newUrl });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        login,
        register,
        loginWithGithubOAuth,
        handleOAuthToken,
        logout,
        refreshUser,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
