"use client";

import { create } from "zustand";
import { AuthUser } from "./auth";
import { StorageService } from "@/shared/services/storageService";
import { logger } from "@/shared/utils/logger";

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
      const token = StorageService.getAccessToken();
      const refreshToken = StorageService.getRefreshToken();
      const roles = StorageService.getRoles();

      if (!token) {
        logger.info("Токен не найден в localStorage");
        return;
      }
      
      const payloadBase64 = token.split(".")[1];
      const payloadJson = JSON.parse(atob(payloadBase64));
      const email: string = payloadJson.sub || "";
      const name: string = payloadJson.fullName || payloadJson.name || (email ? email.split("@")[0] : "");

      set({
        user: { email, name, roles, accessToken: token, refreshToken: refreshToken || undefined },
      });
      
      logger.success("Пользователь загружен из localStorage", { email, name });
    } catch (error) {
      logger.error("Ошибка загрузки пользователя из localStorage", error);
    }
  },
  logout: () => {
    if (typeof window !== "undefined") {
      StorageService.clearTokens();
    }
    set({ user: null });
    logger.info("Пользователь вышел из системы");
  },
}));


