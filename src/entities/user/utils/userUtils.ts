import { User, UserRole, RegisterFormValues } from "../model/types";

/**
 * Проверяет, аутентифицирован ли пользователь
 */
export function isUserAuthenticated(user: User | null): boolean {
  return user !== null && !!user.accessToken;
}

/**
 * Получает роль пользователя
 */
export function getUserRole(user: User | null): string {
  return user?.roles?.[0] || "Пользователь";
}

/**
 * Проверяет, имеет ли пользователь определенную роль
 */
export function hasUserRole(user: User | null, role: UserRole): boolean {
  return user?.roles?.includes(role) ?? false;
}

/**
 * Проверяет, является ли пользователь администратором
 */
export function isUserAdmin(user: User | null): boolean {
  return hasUserRole(user, UserRole.DEVELOPER);
}

/**
 * Получает отображаемое имя пользователя
 */
export function getUserDisplayName(user: User | null): string {
  return user?.name || user?.email || "Пользователь";
}

/**
 * Получает email пользователя
 */
export function getUserEmail(user: User | null): string {
  return user?.email || "";
}

/**
 * Валидация формы регистрации
 */
export function validateRegisterForm(values: RegisterFormValues): string | null {
  const { email, password, passwordConfirm, fullName, position } = values;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) return "Введите корректный email";
  if (!password || password.length < 6 || password.length > 100)
    return "Пароль должен быть от 6 до 100 символов";
  if (password !== passwordConfirm) return "Пароли не совпадают";
  if (!fullName || fullName.length < 5 || fullName.length > 100)
    return "Полное имя должно быть от 5 до 100 символов";
  if (!position || position.length > 100)
    return "Должность не может быть пустой и должна быть ≤ 100 символов";

  return null;
}

/**
 * Парсинг JWT токена для получения email
 */
export function parseEmailFromToken(token: string): string {
  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = JSON.parse(atob(payloadBase64));
    return payloadJson.sub || "";
  } catch {
    return "";
  }
}

/**
 * Парсинг JWT токена для получения имени
 */
export function parseNameFromToken(token: string, emailFallback: string): string {
  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = JSON.parse(atob(payloadBase64));
    return payloadJson.fullName || payloadJson.name || (emailFallback ? emailFallback.split("@")[0] : "");
  } catch {
    return emailFallback ? emailFallback.split("@")[0] : "";
  }
}

/**
 * Создание объекта пользователя из токена
 */
export function createUserFromToken(token: string, refreshToken?: string): User | null {
  try {
    const email = parseEmailFromToken(token);
    const name = parseNameFromToken(token, email);
    
    if (!email) return null;
    
    // Получаем роли из localStorage
    const rolesRaw = localStorage.getItem("roles");
    const roles: string[] = rolesRaw ? JSON.parse(rolesRaw) : [];
    
    return {
      id: email,
      email,
      name,
      roles: roles as UserRole[],
      accessToken: token,
      refreshToken,
    };
  } catch {
    return null;
  }
}

/**
 * Сохранение пользователя в localStorage
 */
export function saveUserToStorage(user: User): void {
  if (typeof window === "undefined") return;
  
  if (user.accessToken) {
    localStorage.setItem("accessToken", user.accessToken);
  }
  if (user.refreshToken) {
    localStorage.setItem("refreshToken", user.refreshToken);
  }
  if (user.roles.length > 0) {
    localStorage.setItem("roles", JSON.stringify(user.roles));
  }
}

/**
 * Очистка данных пользователя из localStorage
 */
export function clearUserFromStorage(): void {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("roles");
}

/**
 * Загрузка пользователя из localStorage
 */
export function loadUserFromStorage(): User | null {
  if (typeof window === "undefined") return null;
  
  try {
    const token = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken") || undefined;
    
    if (!token) return null;
    
    return createUserFromToken(token, refreshToken);
  } catch {
    return null;
  }
}
