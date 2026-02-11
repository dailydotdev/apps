import { useState, useCallback, useEffect, useMemo } from 'react';
import type { PromotedTask, PromotedChecklistConfig } from '../lib/brand';

interface TaskState {
  isCompleted: boolean;
  completedAt?: Date;
}

interface UsePromotedChecklistReturn {
  /** The checklist configuration */
  config: PromotedChecklistConfig | null;
  /** Task states mapped by task ID */
  taskStates: Map<string, TaskState>;
  /** Complete a task */
  completeTask: (taskId: string) => void;
  /** Check if a task is completed */
  isTaskCompleted: (taskId: string) => boolean;
  /** Number of completed tasks */
  completedCount: number;
  /** Total number of tasks */
  totalCount: number;
  /** Progress percentage (0-100) */
  progress: number;
  /** Total cores earned */
  coresEarned: number;
  /** Whether all tasks are completed */
  isComplete: boolean;
  /** Reset all task states */
  reset: () => void;
}

const STORAGE_KEY = 'promoted_checklist_tasks';

/**
 * usePromotedChecklist Hook
 *
 * Manages the state of a promoted checklist, including:
 * - Task completion tracking
 * - Progress calculation
 * - Cores earned calculation
 * - Persistence to localStorage (for prototype)
 *
 * In production, this would sync with the backend.
 */
export const usePromotedChecklist = (
  config: PromotedChecklistConfig | null,
): UsePromotedChecklistReturn => {
  const [taskStates, setTaskStates] = useState<Map<string, TaskState>>(
    new Map(),
  );

  // Load saved state from localStorage on mount
  useEffect(() => {
    if (!config) {
      return;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Record<
          string,
          { isCompleted: boolean; completedAt?: string }
        >;
        const newStates = new Map<string, TaskState>();

        Object.entries(parsed).forEach(([taskId, state]) => {
          newStates.set(taskId, {
            isCompleted: state.isCompleted,
            completedAt: state.completedAt
              ? new Date(state.completedAt)
              : undefined,
          });
        });

        setTaskStates(newStates);
      }
    } catch (error) {
      // Ignore localStorage errors
    }
  }, [config]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (taskStates.size === 0) {
      return;
    }

    try {
      const toSave: Record<
        string,
        { isCompleted: boolean; completedAt?: string }
      > = {};
      taskStates.forEach((state, taskId) => {
        toSave[taskId] = {
          isCompleted: state.isCompleted,
          completedAt: state.completedAt?.toISOString(),
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      // Ignore localStorage errors
    }
  }, [taskStates]);

  const completeTask = useCallback((taskId: string): void => {
    setTaskStates((prev) => {
      const newStates = new Map(prev);
      newStates.set(taskId, {
        isCompleted: true,
        completedAt: new Date(),
      });
      return newStates;
    });
  }, []);

  const isTaskCompleted = useCallback(
    (taskId: string): boolean => {
      return taskStates.get(taskId)?.isCompleted ?? false;
    },
    [taskStates],
  );

  const reset = useCallback((): void => {
    setTaskStates(new Map());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Ignore localStorage errors
    }
  }, []);

  const { completedCount, totalCount, coresEarned, isComplete } =
    useMemo(() => {
      if (!config) {
        return {
          completedCount: 0,
          totalCount: 0,
          coresEarned: 0,
          isComplete: false,
        };
      }

      const completed = config.tasks.filter(
        (task) => taskStates.get(task.id)?.isCompleted,
      );

      return {
        completedCount: completed.length,
        totalCount: config.tasks.length,
        coresEarned: completed.reduce((sum, task) => sum + task.reward, 0),
        isComplete: completed.length === config.tasks.length,
      };
    }, [config, taskStates]);

  const progress = useMemo(() => {
    if (totalCount === 0) {
      return 0;
    }
    return Math.round((completedCount / totalCount) * 100);
  }, [completedCount, totalCount]);

  return {
    config,
    taskStates,
    completeTask,
    isTaskCompleted,
    completedCount,
    totalCount,
    progress,
    coresEarned,
    isComplete,
    reset,
  };
};
