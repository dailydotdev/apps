import { useQuery } from '@tanstack/react-query';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { getReadingStreak, UserStreak } from '../../graphql/users';
import { useAuthContext } from '../../contexts/AuthContext';

interface UserReadingStreak {
  streak: UserStreak;
  loading: boolean;
}

export const useReadingStreak = (): UserReadingStreak => {
  const { user } = useAuthContext();
  const { data: streak } = useQuery(
    generateQueryKey(RequestKey.UserStreak, user),
    getReadingStreak,
  );

  return {
    streak,
    loading: false,
  };
};
