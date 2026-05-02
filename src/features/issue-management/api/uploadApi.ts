import { ENDPOINTS } from "@/shared/config/api";
import { apiFetch } from "@/shared/services/apiClient";
import { handleApiError } from "@/shared/utils/errorHandler";
import { logger } from "@/shared/utils/logger";
import { absolutizeUploadedImageUrl } from "@/shared/utils/htmlUtils";

/** Загрузка изображения для описания задачи; возвращает публичный URL на этом же сервере. */
export async function uploadDescriptionImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiFetch(ENDPOINTS.upload.image, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const msg = await handleApiError(res, "Не удалось загрузить изображение");
    throw new Error(msg);
  }

  const data = (await res.json()) as { url?: string };
  if (!data.url) {
    logger.error("Ответ загрузки без url", data);
    throw new Error("Сервер не вернул URL изображения");
  }

  return absolutizeUploadedImageUrl(data.url);
}
