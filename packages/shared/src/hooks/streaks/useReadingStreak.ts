import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { getReadingStreak, UserStreak } from '../../graphql/users';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';
import useDebounce from '../useDebounce';

interface UserReadingStreak {
  streak: UserStreak;
  isLoading: boolean;
  shouldShowPopup: boolean;
  checkReadingStreak: () => Promise<void>;
}

export const useReadingStreak = (): UserReadingStreak => {
  const { user } = useAuthContext();
  const { data: streak, isLoading } = useQuery(
    generateQueryKey(RequestKey.UserStreak, user),
    getReadingStreak,
    { staleTime: StaleTime.Default },
  );
  const { checkHasCompleted } = useActions();
  const hasReadToday =
    new Date(streak?.lastViewAt).getDate() === new Date().getDate();
  const userStreakQueryKeyRef = useRef<unknown[]>();
  const queryClient = useQueryClient();

  const [clearQueries] = useDebounce(async () => {
    if (!hasReadToday && userStreakQueryKeyRef.current?.length > 0) {
      await queryClient.invalidateQueries(userStreakQueryKeyRef.current);
    }
  }, 100);

  return {
    streak,
    isLoading,
    checkReadingStreak: async () => {
      const userStreakQueryKey = generateQueryKey(RequestKey.UserStreak, user);
      userStreakQueryKeyRef.current = userStreakQueryKey;

      clearQueries(hasReadToday ?? true);
    },
    shouldShowPopup:
      user?.createdAt < '2024-03-14T00:00:00.000Z' &&
      !checkHasCompleted(ActionType.ExistingUserSeenStreaks),
  };
};
