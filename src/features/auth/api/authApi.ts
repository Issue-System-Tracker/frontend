import { ENDPOINTS } from "@/shared/config/api";
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse, 
  RefreshRequest, 
  RefreshResponse 
} from "../model/auth";

// Логин
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

// Регистрация
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const res = await fetch(ENDPOINTS.auth.register, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errorMessage = "Ошибка регистрации";
    
    const responseClone = res.clone();
    
    try {
      const errorData = await res.json();
      
      // Формируем детальное сообщение об ошибке
      if (errorData.errors) {
        const errorDetails = Object.entries(errorData.errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ');
        errorMessage = `Ошибки валидации: ${errorDetails}`;
      } else {
        errorMessage = errorData.message || errorData.error || errorMessage;
      }
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

// Обновление токена
export async function refreshToken(data: RefreshRequest): Promise<RefreshResponse> {
  const res = await fetch(ENDPOINTS.auth.refresh, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errorMessage = "Ошибка обновления токена";
    
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

// Логаут
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
