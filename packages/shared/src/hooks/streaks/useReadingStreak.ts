import { useQuery } from '@tanstack/react-query';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { getReadingStreak, UserStreak } from '../../graphql/users';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';

interface UserReadingStreak {
  streak: UserStreak;
  isLoading: boolean;
  shouldShowPopup: boolean;
}

export const useReadingStreak = (): UserReadingStreak => {
  const { user } = useAuthContext();
  const { data: streak, isLoading } = useQuery(
    generateQueryKey(RequestKey.UserStreak, user),
    getReadingStreak,
    { enabled: true, staleTime: StaleTime.Default },
  );
  const { checkHasCompleted } = useActions();

  return {
    streak,
    isLoading,
    shouldShowPopup:
      user?.createdAt < '2024-03-14T00:00:00.000Z' &&
      !checkHasCompleted(ActionType.ExistingUserSeenStreaks),
  };
};
