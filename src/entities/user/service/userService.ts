import { register as registerApi } from "../../../features/auth/api/registerApi";
import { login as loginApi } from "../../../features/auth/api/loginApi";
import { logoutApi } from "../../../features/auth/api/logoutApi";
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  User,
  UserRole 
} from "../model/types";
import { useUserStore } from "../model/userStore";

export async function submitRegister(data: RegisterRequest): Promise<RegisterResponse> {
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
      
      // обновляем store
      const email = parseEmail(res.jwtResponse.accessToken);
      const name = parseName(res.jwtResponse.accessToken, email);
      const user: User = {
        id: email,
        email,
        name,
        roles: (res.role || []) as UserRole[],
        accessToken: res.jwtResponse.accessToken,
        refreshToken: res.jwtResponse.refreshToken,
      };
      
      useUserStore.getState().setUser(user);
    }

    window.location.href = "/dashboard";
    return res;
  } catch (err: unknown) {
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

export async function submitRegisterAndLogin(data: RegisterRequest): Promise<LoginResponse> {
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
      const user: User = {
        id: email,
        email,
        name,
        roles: (loginRes.role || []) as UserRole[],
        accessToken: loginRes.jwtResponse.accessToken,
        refreshToken: loginRes.jwtResponse.refreshToken,
      };
      
      useUserStore.getState().setUser(user);
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

export async function logout(): Promise<void> {
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
    useUserStore.getState().logout();
    window.location.href = "/login";
  }
}

// Утилиты для парсинга JWT токена
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
