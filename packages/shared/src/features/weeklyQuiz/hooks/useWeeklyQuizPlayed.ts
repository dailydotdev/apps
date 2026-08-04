import { useCallback } from 'react';
import usePersistentContext from '../../../hooks/usePersistentContext';

export interface UseWeeklyQuizPlayed {
  hasPlayed: boolean;
  markPlayed: () => void;
  resetPlayed: () => void;
}

// Client-side "played this week" flag, keyed by the active quiz id so it resets
// on its own each week. The quiz is a one-shot: starting it spends the attempt,
// so refreshing or leaving mid-way never grants a retry. The server's
// hasCompletedThisWeek is the source of truth once a run is submitted; this
// persists the commitment locally (across reloads, via IndexedDB) so the
// abandon-before-submit case is covered too.
export const useWeeklyQuizPlayed = (
  quizId: string | null | undefined,
): UseWeeklyQuizPlayed => {
  const [played, setPlayed] = usePersistentContext<boolean>(
    `weekly_quiz_played:${quizId ?? 'none'}`,
    false,
  );

  const markPlayed = useCallback(() => {
    if (!played) {
      setPlayed(true);
    }
  }, [played, setPlayed]);

  const resetPlayed = useCallback(() => {
    setPlayed(false);
  }, [setPlayed]);

  return { hasPlayed: !!played, markPlayed, resetPlayed };
};
