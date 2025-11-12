// Типы данных пользователя
export interface User {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  accessToken?: string;
  refreshToken?: string;
}

// Роли пользователей
export enum UserRole {
  USER = 'ROLE_USER',
  DEVELOPER = 'ROLE_DEVELOPER',
  QA = 'ROLE_QA'
}

// Запросы для аутентификации
export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Ответы аутентификации
export interface RegisterResponse {
  message?: string;
}

export interface LoginResponse {
  jwtResponse: {
    accessToken: string;
    expiresIn: number;
    refreshExpiresIn: number;
    refreshToken: string;
  };
  role: string[];
}

// Форма регистрации
export interface RegisterFormValues {
  email: string;
  password: string;
  passwordConfirm: string;
  fullName: string;
}
