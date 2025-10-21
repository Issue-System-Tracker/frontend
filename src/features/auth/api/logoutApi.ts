import { ENDPOINTS } from "@/shared/config/api";

export interface RefreshTokenRequest {
  refreshToken: string;
}

export async function logoutApi(body: RefreshTokenRequest): Promise<void> {
  const res = await fetch(ENDPOINTS.auth.logout, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let errorMessage = "Ошибка выхода";
    const clone = res.clone();
    try {
      const data = await res.json();
      errorMessage = data.message || errorMessage;
    } catch {
      try {
        const text = await clone.text();
        errorMessage = text || errorMessage;
      } catch {
        errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
      }
    }
    throw new Error(errorMessage);
  }
}


