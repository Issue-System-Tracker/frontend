/**
 * Обрабатывает ошибки HTTP ответов и возвращает понятное сообщение для пользователя
 */
export async function handleApiError(
  response: Response,
  defaultMessage: string
): Promise<string> {
  // Специальная обработка для 403 - запрещен доступ
  if (response.status === 403) {
    let errorMessage = "У вас нет прав для этого действия";
    
    try {
      const errorData = await response.clone().json();
      // Если сервер вернул свое сообщение, используем его
      if (errorData.message && errorData.message.toLowerCase().includes('прав') || 
          errorData.message.toLowerCase().includes('доступ') ||
          errorData.message.toLowerCase().includes('forbidden')) {
        errorMessage = errorData.message;
      }
    } catch {
      // Если не удалось распарсить JSON, используем стандартное сообщение
    }
    
    return errorMessage;
  }
  
  // Для остальных ошибок пытаемся получить сообщение от сервера
  let errorMessage = defaultMessage;
  
  try {
    const errorData = await response.clone().json();
    errorMessage = errorData.message || errorData.error || errorMessage;
  } catch {
    try {
      const text = await response.clone().text();
      if (text) {
        errorMessage = text || errorMessage;
      } else {
        errorMessage = `Ошибка ${response.status}: ${response.statusText}`;
      }
    } catch {
      errorMessage = `Ошибка ${response.status}: ${response.statusText}`;
    }
  }
  
  return errorMessage;
}

