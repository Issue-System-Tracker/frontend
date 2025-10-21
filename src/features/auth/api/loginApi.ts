import { ENDPOINTS } from "@/shared/config/api";
import { LoginRequest, LoginResponse } from "../model/auth";

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(ENDPOINTS.auth.login, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errorMessage = "Ошибка авторизации";
    
    const responseClone = res.clone();
    
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      try {
        const errorText = await responseClone.text();
        errorMessage = errorText || errorMessage;
      } catch {
        errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
      }
    }
    
    throw new Error(errorMessage);
  }

  return res.json();
}
