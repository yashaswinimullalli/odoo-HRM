"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile } from "@/lib/types";
import { mockLogin, mockRegister, updateUser } from "@/lib/mockStore";

interface AuthContextType {
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (data: {
    fullName: string;
    employeeId: string;
    email: string;
    role: "admin" | "employee";
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

  // Restore session from sessionStorage on mount
  useEffect(() => {
    try {
      const storedProfile = sessionStorage.getItem(SESSION_KEY);
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const persistProfile = (user: UserProfile) => {
    setProfile(user);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  };

  const login = async (email: string, password: string): Promise<UserProfile> => {
    // Simulate async delay
    await new Promise((r) => setTimeout(r, 600));
    const user = mockLogin(email, password);
    if (!user) throw new Error("Invalid email or password.");
    persistProfile(user);
    return user;
  };

  const register = async (data: {
    fullName: string;
    employeeId: string;
    email: string;
    role: "admin" | "employee";
  }): Promise<UserProfile> => {
    await new Promise((r) => setTimeout(r, 600));
    const user = mockRegister(data);
    persistProfile(user);
    return user;
  };

  const logout = () => {
    setProfile(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = updateUser(profile.uid, data);
    persistProfile(updated);
  };

  return (
    <AuthContext.Provider value={{ profile, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
