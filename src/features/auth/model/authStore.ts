"use client";

import { create } from "zustand";
import { AuthUser } from "./auth";

type AuthState = {
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
  hydrateFromStorage: () => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
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
        user: { email, name, roles, accessToken: token, refreshToken },
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
}));


