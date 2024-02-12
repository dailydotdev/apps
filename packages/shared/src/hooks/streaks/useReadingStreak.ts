import { useQuery } from '@tanstack/react-query';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { getReadingStreak, UserStreak } from '../../graphql/users';
import { useAuthContext } from '../../contexts/AuthContext';
import { useStreakExperiment } from './useStreakExperiment';

interface UserReadingStreak {
  streak: UserStreak;
  isLoading: boolean;
  isEnabled: boolean;
}

export const useReadingStreak = (): UserReadingStreak => {
  const { user } = useAuthContext();
  const { shouldShowStreak } = useStreakExperiment();
  const { data: streak, isLoading } = useQuery(
    generateQueryKey(RequestKey.UserStreak, user),
    getReadingStreak,
    { enabled: shouldShowStreak },
  );

  return {
    streak,
    isLoading,
    isEnabled: shouldShowStreak,
  };
};
