import { useQuery } from '@tanstack/react-query';
import {
  SourcePostModeration,
  SourcePostModerationStatus,
} from '../../graphql/squads';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';

interface UseSquadPendingPosts {
  data: SourcePostModeration[];
  isFetched: boolean;
}

export const useSquadPendingPosts = (squadId: string): UseSquadPendingPosts => {
  const { user } = useAuthContext();
  // TODO:: MI-596
  const { data } = useQuery(
    generateQueryKey(RequestKey.SquadPostRequests, user, squadId),
    () => {
      const dummy: SourcePostModeration = {
        id: 'random id',
        status: SourcePostModerationStatus.Pending,
        createdBy: user,
        createdAt: new Date().toISOString(),
        title: 'dummy title',
      };

      return Promise.resolve([dummy]);
    },
    { enabled: !!squadId },
  );

  return { isFetched: true, data };
};
