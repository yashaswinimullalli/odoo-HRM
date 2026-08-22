"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile } from "@/lib/types";
import { api, getAuthToken, removeAuthToken } from "@/lib/api";

interface AuthContextType {
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (data: {
    fullName: string;
    employeeId: string;
    email: string;
    role: "admin" | "employee";
    password?: string;
  }) => Promise<UserProfile>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType>({
  profile: null,
  loading: true,
  login: async () => { throw new Error("Not implemented"); },
  register: async () => { throw new Error("Not implemented"); },
  logout: () => {},
  updateProfile: () => {},
});

export const useAuth = () => useContext(AuthContext);

const SESSION_KEY = "dayflow_session_uid";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from token or sessionStorage on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const token = getAuthToken();
        if (token) {
          try {
            const userProfile = await api.getMe();
            setProfile(userProfile);
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(userProfile));
            return;
          } catch (e) {
            console.warn("[Auth] Token verification failed:", e);
          }
        }

        const storedProfile = sessionStorage.getItem(SESSION_KEY);
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const persistProfile = (user: UserProfile) => {
    setProfile(user);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  };

  const login = async (email: string, password: string): Promise<UserProfile> => {
    const user = await api.login(email.trim(), password);
    persistProfile(user);
    return user;
  };

  const register = async (data: {
    fullName: string;
    employeeId: string;
    email: string;
    role: "admin" | "employee";
    password?: string;
  }): Promise<UserProfile> => {
    const user = await api.register(data);
    persistProfile(user);
    return user;
  };

  const logout = () => {
    setProfile(null);
    removeAuthToken();
    sessionStorage.removeItem(SESSION_KEY);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...data };
    persistProfile(updated);
  };

  return (
    <AuthContext.Provider value={{ profile, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
