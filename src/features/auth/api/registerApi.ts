import { ENDPOINTS } from "@/shared/config/api";
import { RegisterRequest, RegisterResponse } from "../model/auth";

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const res = await fetch(ENDPOINTS.auth.register, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errorMessage = "Ошибка регистрации";
    
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

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  } else {
    return { message: "Регистрация успешна" };
  }
}


