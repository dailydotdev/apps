import { useQuery } from '@tanstack/react-query';
import { sharePost } from '../../../__tests__/fixture/post';
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
  const { data } = useQuery(
    generateQueryKey(RequestKey.SquadPostRequests, user, squadId),
    () =>
      Promise.resolve([
        {
          postId: '1',
          moderatorId: null,
          sourceId: 'a',
          status: SourcePostModerationStatus.Pending,
          createdAt: new Date(),
          post: sharePost,
        },
      ]),
    { enabled: !!squadId },
  );

  return { isFetched: true, data };
};
