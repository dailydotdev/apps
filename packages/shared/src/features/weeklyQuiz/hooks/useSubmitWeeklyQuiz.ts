import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { gqlClient } from '../../../graphql/common';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { SUBMIT_WEEKLY_QUIZ_MUTATION } from '../graphql';
import type { WeeklyQuizAnswerInput, WeeklyQuizResult } from '../types';

export interface SubmitWeeklyQuizInput {
  quizId: string;
  answers: WeeklyQuizAnswerInput[];
  // Total thinking time in milliseconds (feedback-reading time excluded).
  timeMs: number;
}

interface UseSubmitWeeklyQuiz {
  submit: (input: SubmitWeeklyQuizInput) => Promise<WeeklyQuizResult>;
  isPending: boolean;
}

// Submits a finished attempt. Logged-in only — anonymous players hold their
// result in memory and submit right after signing in. The backend recomputes
// the score authoritatively and returns the rank, so we invalidate the
// leaderboard + status caches to reflect the new standing.
export const useSubmitWeeklyQuiz = (): UseSubmitWeeklyQuiz => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (input: SubmitWeeklyQuizInput) => {
      const res = await gqlClient.request<{
        submitWeeklyQuizResult: WeeklyQuizResult;
      }>(SUBMIT_WEEKLY_QUIZ_MUTATION, { input });

      return res.submitWeeklyQuizResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.WeeklyQuizLeaderboard, user),
      });
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.WeeklyQuizStatus, user),
      });
    },
  });

  return { submit: mutateAsync, isPending };
};
