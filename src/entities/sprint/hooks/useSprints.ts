import { useState, useEffect, useCallback } from 'react';
import { Sprint } from '../model/types';
import { fetchSprints } from '@/features/sprint-management';
import { logger } from '@/shared/utils/logger';

/**
 * Хук для загрузки спринтов проекта
 * @param projectId - ID проекта
 * @returns объект с спринтами, состоянием загрузки и функцией перезагрузки
 */
export function useSprints(projectId: number | undefined) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSprints = useCallback(async () => {
    if (!projectId) {
      logger.warn("projectId не определен при загрузке спринтов");
      setSprints([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const sprintsData = await fetchSprints(projectId);
      logger.info("Загружено спринтов в useSprints", { 
        count: sprintsData.length, 
        sprints: sprintsData,
        firstSprintStructure: sprintsData[0] ? Object.keys(sprintsData[0]) : []
      });
      setSprints(sprintsData);
    } catch (err) {
      logger.error("Ошибка загрузки спринтов", err);
      setError(err instanceof Error ? err.message : "Ошибка загрузки спринтов");
      setSprints([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      loadSprints();
    }
  }, [projectId, loadSprints]);

  return { sprints, loading, error, reload: loadSprints };
}

