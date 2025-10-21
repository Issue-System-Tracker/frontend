"use client";

import { create } from "zustand";
import { User, UserRole } from "./types";

type UserState = {
  user: User | null;
  setUser: (user: User | null) => void;
  hydrateFromStorage: () => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  getUserRole: () => string;
};

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  
  setUser: (user) => set({ user }),
  
  hydrateFromStorage: () => {
    if (typeof window === "undefined") return;
    try {
      const token = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken") || undefined;
      const rolesRaw = localStorage.getItem("roles");
      const roles: string[] = rolesRaw ? JSON.parse(rolesRaw) : [];

      if (!token) return;
      
      const payloadBase64 = token.split(".")[1];
      const payloadJson = JSON.parse(atob(payloadBase64));
      const email: string = payloadJson.sub || "";
      const name: string = payloadJson.fullName || payloadJson.name || (email ? email.split("@")[0] : "");

      set({
        user: { 
          id: email, // Используем email как id для совместимости
          email, 
          name, 
          roles: roles as UserRole[], 
          accessToken: token, 
          refreshToken 
        },
      });
    } catch {
      // ignore
    }
  },
  
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("roles");
    }
    set({ user: null });
  },
  
  isAuthenticated: () => {
    const { user } = get();
    return user !== null && !!user.accessToken;
  },
  
  getUserRole: () => {
    const { user } = get();
    return user?.roles?.[0] || "Пользователь";
  },
}));
