import { StorageService } from "./storageService";
import { refreshAccessToken } from "@/features/auth/service/authService";
import { logger } from "@/shared/utils/logger";

// Очередь запросов, ожидающих обновления токена
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;
const pendingRequests: Array<{
  resolve: (value: Response) => void;
  reject: (error: Error) => void;
  url: string;
  options: RequestInit;
  headers: Headers;
}> = [];

/**
 * Выполняет запрос с токеном
 */
async function executeRequest(
  url: string,
  options: RequestInit,
  headers: Headers
): Promise<Response> {
  return await fetch(url, { ...options, headers });
}

/**
 * Обрабатывает все ожидающие запросы после обновления токена
 */
async function processPendingRequests(success: boolean): Promise<void> {
  const newToken = success ? StorageService.getAccessToken() : null;

  for (const request of pendingRequests) {
    if (success && newToken) {
      request.headers.set("Authorization", `Bearer ${newToken}`);
      try {
        const response = await executeRequest(request.url, request.options, request.headers);
        request.resolve(response);
      } catch (error) {
        request.reject(error instanceof Error ? error : new Error("Ошибка повторного запроса"));
      }
    } else {
      request.reject(new Error("Не удалось обновить токен авторизации"));
    }
  }

  pendingRequests.length = 0;
}

/**
 * Универсальный клиент для API запросов с автоматическим обновлением токена при 401
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Получаем текущий токен
  const token = StorageService.getAccessToken();

  // Если токена нет, выбрасываем ошибку (кроме запросов на refresh, login, register)
  if (!token && !url.includes('/auth/refresh') && !url.includes('/auth/login') && !url.includes('/auth/register')) {
    throw new Error("Токен авторизации не найден. Пожалуйста, войдите в систему.");
  }

  // Добавляем токен в заголовки
  const headers = new Headers(options.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Обновляем опции с новыми заголовками
  const requestOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    // Выполняем запрос
    let response = await executeRequest(url, requestOptions, headers);

    // Если получили 401, пытаемся обновить токен
    if (response.status === 401) {
      logger.info("Получен 401, обновляем токен...", { url });

      // Если токен уже обновляется, добавляем запрос в очередь и ждем
      if (isRefreshing && refreshPromise) {
        logger.info("Токен уже обновляется, добавляем запрос в очередь", { url });
        return new Promise<Response>((resolve, reject) => {
          pendingRequests.push({
            resolve,
            reject,
            url,
            options: requestOptions,
            headers: new Headers(headers),
          });
        });
      }

      // Начинаем обновление токена
      isRefreshing = true;
      refreshPromise = refreshAccessToken()
        .then((result) => {
          const success = result !== null;
          return success;
        })
        .catch((error) => {
          logger.error("Ошибка при обновлении токена", error);
          return false;
        })
        .then(async (success) => {
          // Обрабатываем очередь ожидающих запросов
          await processPendingRequests(success);
          isRefreshing = false;
          refreshPromise = null;
          return success;
        });

      const refreshed = await refreshPromise;

      if (refreshed) {
        // Получаем новый токен и повторяем запрос
        const newToken = StorageService.getAccessToken();
        if (newToken) {
          logger.info("Токен обновлен, повторяем запрос", { url });
          headers.set("Authorization", `Bearer ${newToken}`);
          response = await executeRequest(url, requestOptions, headers);
          
          // Если после обновления токена снова получили 401, выбрасываем ошибку
          if (response.status === 401) {
            throw new Error("Ошибка авторизации после обновления токена");
          }
        } else {
          throw new Error("Не удалось получить новый токен после обновления");
        }
      } else {
        // Если не удалось обновить токен, выбрасываем ошибку
        throw new Error("Не удалось обновить токен авторизации");
      }
    }

    return response;
  } catch (error) {
    logger.error("Ошибка API запроса", { url, error });
    throw error;
  }
}

/**
 * Очистка состояния (для тестов или при logout)
 */
export function resetApiClient(): void {
  isRefreshing = false;
  refreshPromise = null;
  pendingRequests.length = 0;
}
