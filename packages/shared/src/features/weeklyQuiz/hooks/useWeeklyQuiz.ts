import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { gqlClient } from '../../../graphql/common';
import { disabledRefetch } from '../../../lib/func';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { WEEKLY_QUIZ_QUERY } from '../graphql';
import type { WeeklyQuiz } from '../types';
import { isWeeklyQuizDemo } from '../demoMode';
import { sampleWeeklyQuiz } from '../sampleWeeklyQuiz';

interface UseWeeklyQuiz {
  quiz: WeeklyQuiz | undefined;
  isPending: boolean;
}

// Fetches the active quiz's questions. Only fires once we have the quiz id
// (from useWeeklyQuizStatus) — the modal opens on the intro screen and loads
// questions lazily before the player hits "Start".
export const useWeeklyQuiz = (
  quizId: string | null | undefined,
): UseWeeklyQuiz => {
  const { user } = useAuthContext();
  const demo = isWeeklyQuizDemo();

  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.WeeklyQuiz, user, quizId),
    queryFn: () =>
      gqlClient.request<{ weeklyQuiz: WeeklyQuiz }>(WEEKLY_QUIZ_QUERY, {
        id: quizId,
      }),
    enabled: !!quizId && !demo,
    staleTime: StaleTime.OneHour,
    ...disabledRefetch,
  });

  if (demo) {
    return { quiz: sampleWeeklyQuiz, isPending: false };
  }

  return { quiz: data?.weeklyQuiz, isPending };
};
