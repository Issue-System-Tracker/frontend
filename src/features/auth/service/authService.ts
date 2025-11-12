import { login, register, logoutApi, refreshToken as refreshTokenApi } from "../api/authApi";
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RefreshResponse 
} from "../model/auth";
import { useAuthStore } from "../model/authStore";
import { StorageService } from "@/shared/services/storageService";
import { logger } from "@/shared/utils/logger";

export async function submitRegister(data: RegisterRequest) {
  try {
    return await register(data);
  } catch (err: unknown) {
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

export async function submitLogin(data: LoginRequest): Promise<LoginResponse> {
  try {
    const res = await login(data);

    if (res.jwtResponse?.accessToken) {
      StorageService.setTokens(
        res.jwtResponse.accessToken, 
        res.jwtResponse.refreshToken, 
        res.role || []
      );
      
      const email = parseEmail(res.jwtResponse.accessToken);
      const name = parseName(res.jwtResponse.accessToken, email);
      useAuthStore.getState().setUser({
        email,
        name,
        roles: res.role || [],
        accessToken: res.jwtResponse.accessToken,
        refreshToken: res.jwtResponse.refreshToken,
      });
      
      logger.success("Пользователь успешно авторизован");
      
      // Воспроизведение звука успешной авторизации
      const authSound = new Audio('/sounds/auth-sound.mp3');
      authSound.volume = 0.5; // Уменьшаем громкость
      
      // Ждем пока звук проиграется перед переходом
      await new Promise<void>((resolve) => {
        authSound.play().catch(err => {
          console.warn('Не удалось воспроизвести звук авторизации:', err);
          resolve(); // Если ошибка воспроизведения, все равно переходим
        });
        
        authSound.onended = () => {
          resolve();
        };
        
        // Максимальная задержка 2 секунды на случай если звук не загрузится
        setTimeout(() => {
          resolve();
        }, 2000);
      });
    }

    window.location.href = "/project-selector";
    return res;
  } catch (err: unknown) {
    logger.error("Ошибка авторизации", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

export async function submitRegisterAndLogin(data: RegisterRequest) {
  try {
    // 1. Валидация данных
    if (!data.email || !data.email.includes('@')) {
      throw new Error("Введите корректный email");
    }
    if (!data.password || data.password.length < 6 || data.password.length > 100) {
      throw new Error("Пароль должен быть от 6 до 100 символов");
    }
    if (!data.fullName || data.fullName.length < 5 || data.fullName.length > 100) {
      throw new Error("Полное имя должно быть от 5 до 100 символов");
    }

    // 2. Регистрация
    await register(data);

    // 3. Авто-логин
    const loginRes = await login({ email: data.email, password: data.password });

    // 4. Сохраняем токен и обновляем store
    if (loginRes.jwtResponse?.accessToken) {
      StorageService.setTokens(
        loginRes.jwtResponse.accessToken, 
        loginRes.jwtResponse.refreshToken, 
        loginRes.role || []
      );

      const email = parseEmail(loginRes.jwtResponse.accessToken);
      const name = parseName(loginRes.jwtResponse.accessToken, email);
      useAuthStore.getState().setUser({
        email,
        name,
        roles: loginRes.role || [],
        accessToken: loginRes.jwtResponse.accessToken,
        refreshToken: loginRes.jwtResponse.refreshToken,
      });
      
      logger.success("Пользователь зарегистрирован и авторизован");
      
      // Воспроизведение звука успешной авторизации
      const authSound = new Audio('/sounds/auth-sound.mp3');
      authSound.volume = 0.5; // Уменьшаем громкость
      
      // Ждем пока звук проиграется перед переходом
      await new Promise<void>((resolve) => {
        authSound.play().catch(err => {
          console.warn('Не удалось воспроизвести звук авторизации:', err);
          resolve(); // Если ошибка воспроизведения, все равно переходим
        });
        
        authSound.onended = () => {
          resolve();
        };
        
        // Максимальная задержка 2 секунды на случай если звук не загрузится
        setTimeout(() => {
          resolve();
        }, 2000);
      });
    } else {
      logger.error("accessToken отсутствует в ответе", loginRes);
    }

    window.location.href = "/project-selector";
    return loginRes;
  } catch (err: unknown) {
    logger.error("Ошибка в submitRegisterAndLogin", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

export async function refreshAccessToken(): Promise<RefreshResponse | null> {
  try {
    const refreshToken = StorageService.getRefreshToken();
    if (!refreshToken) {
      throw new Error("Refresh token не найден");
    }

    const response = await refreshTokenApi({ refreshToken });
    
    // Обновляем токены
    const roles = StorageService.getRoles();
    StorageService.setTokens(response.accessToken, response.refreshToken, roles);
    
    // Обновляем store
    const email = parseEmail(response.accessToken);
    const name = parseName(response.accessToken, email);
    
    useAuthStore.getState().setUser({
      email,
      name,
      roles,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });

    logger.success("Токен успешно обновлен");
    return response;
  } catch (err: unknown) {
    logger.error("Ошибка обновления токена", err);
    // Если не удалось обновить токен, делаем logout
    await logout();
    return null;
  }
}

export async function logout() {
  try {
    const refreshToken = StorageService.getRefreshToken();
    if (refreshToken) {
      await logoutApi({ refreshToken });
    }
  } catch {
    // сервер может быть недоступен — делаем best-effort logout
    logger.warn("Сервер недоступен при логауте, продолжаем локальную очистку");
  } finally {
    StorageService.clearTokens();
    useAuthStore.getState().logout();
    logger.info("Пользователь вышел из системы");
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