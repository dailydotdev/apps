import { sharePost } from '../../../__tests__/fixture/post';
import {
  SourcePostModeration,
  SourcePostModerationStatus,
} from '../../graphql/squads';

interface UseSquadPendingPosts {
  data: SourcePostModeration[];
  isFetched: boolean;
}

export const useSquadPendingPosts = (): UseSquadPendingPosts => {
  return {
    isFetched: true,
    data: [
      {
        postId: '1',
        moderatorId: null,
        sourceId: 'a',
        status: SourcePostModerationStatus.Pending,
        createdAt: new Date(),
        post: sharePost,
      },
    ],
  };
};
