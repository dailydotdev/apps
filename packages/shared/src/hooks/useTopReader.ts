import { useQuery } from '@tanstack/react-query';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';
import { fetchTopReaderById, fetchTopReaders } from '../lib/topReader';
import { disabledRefetch } from '../lib/func';
import type { LoggedUser, PublicProfile } from '../lib/user';
import type { TopReader } from '../components/badges/TopReaderBadge';

type UseTopReaderProps = {
  user: LoggedUser | PublicProfile;
  limit?: number;
  badgeId?: string;
};

type UseTopReader = (props: UseTopReaderProps) => {
  data: TopReader[];
  isLoading: boolean;
};

export const useTopReader: UseTopReader = ({ limit = 5, user, badgeId }) => {
  const { data, isLoading } = useQuery({
    queryKey: generateQueryKey(
      RequestKey.TopReaderBadge,
      user,
      badgeId ?? `latest:${limit}`,
    ),
    queryFn: async () => {
      if (badgeId) {
        return [await fetchTopReaderById(badgeId)];
      }

      return fetchTopReaders(limit, user.id);
    },
    staleTime: StaleTime.OneHour,
    ...disabledRefetch,
  });

  return {
    data,
    isLoading,
  };
};
