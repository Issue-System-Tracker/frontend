import { register as registerApi } from "../api/registerApi";
import { login as loginApi } from "../api/loginApi";
import { logoutApi } from "../api/logoutApi";
import { LoginRequest, LoginResponse, RegisterRequest } from "../model/auth";
import { useAuthStore } from "../model/authStore";

export async function submitRegister(data: RegisterRequest) {
  try {
    return await registerApi(data);
  } catch (err: unknown) {
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

export async function submitLogin(data: LoginRequest): Promise<LoginResponse> {
  try {
    const res = await loginApi(data);

    if (res.jwtResponse?.accessToken) {
      localStorage.setItem("accessToken", res.jwtResponse.accessToken);
      localStorage.setItem("refreshToken", res.jwtResponse.refreshToken);
      if (Array.isArray(res.role)) {
        localStorage.setItem("roles", JSON.stringify(res.role));
      }
      // обновляем zustand
      const email = parseEmail(res.jwtResponse.accessToken);
      const name = parseName(res.jwtResponse.accessToken, email);
      useAuthStore.getState().setUser({
        email,
        name,
        roles: res.role || [],
        accessToken: res.jwtResponse.accessToken,
        refreshToken: res.jwtResponse.refreshToken,
      });
    }

    window.location.href = "/dashboard";

    return res;
  } catch (err: unknown) {
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

export async function submitRegisterAndLogin(data: RegisterRequest) {
  try {
    // 1. Регистрация
    console.log("Начинаем регистрацию...");
    await registerApi(data);
    console.log("Регистрация успешна");

    // 2. Авто-логин
    console.log("Начинаем логин...");
    const loginRes = await loginApi({ email: data.email, password: data.password });
    console.log("Ответ от логина:", loginRes);

    // 3. Сохраняем токен и редирект
    if (loginRes.jwtResponse?.accessToken) {
      localStorage.setItem("accessToken", loginRes.jwtResponse.accessToken);
      localStorage.setItem("refreshToken", loginRes.jwtResponse.refreshToken);
      if (Array.isArray(loginRes.role)) {
        localStorage.setItem("roles", JSON.stringify(loginRes.role));
      }
      console.log("Токен сохранен:", loginRes.jwtResponse.accessToken);

      const email = parseEmail(loginRes.jwtResponse.accessToken);
      const name = parseName(loginRes.jwtResponse.accessToken, email);
      useAuthStore.getState().setUser({
        email,
        name,
        roles: loginRes.role || [],
        accessToken: loginRes.jwtResponse.accessToken,
        refreshToken: loginRes.jwtResponse.refreshToken,
      });
      
      // Редирект на дашборд
      // window.location.href = "/dashboard";
    } else {
      console.error("accessToken отсутствует в ответе:", loginRes);
    }

    return loginRes;
  } catch (err: unknown) {
    console.error("Ошибка в submitRegisterAndLogin:", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

export async function logout() {
  try {
    const refreshToken = localStorage.getItem("refreshToken") || "";
    if (refreshToken) {
      await logoutApi({ refreshToken });
    }
  } catch (e) {
    // сервер может быть недоступен — делаем best-effort logout
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("roles");
    useAuthStore.getState().logout();
    window.location.href = "/login";
  }
}

function parseEmail(token: string): string {
  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = JSON.parse(atob(payloadBase64));
    return payloadJson.sub || "";
  } catch {
    return "";
  }
}

function parseName(token: string, emailFallback: string): string {
  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = JSON.parse(atob(payloadBase64));
    return payloadJson.fullName || payloadJson.name || (emailFallback ? emailFallback.split("@")[0] : "");
  } catch {
    return emailFallback ? emailFallback.split("@")[0] : "";
  }
}