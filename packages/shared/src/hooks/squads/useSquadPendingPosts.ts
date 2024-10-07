import { sharePost } from '../../../__tests__/fixture/post';
import {
  SourcePostModeration,
  SourcePostModerationStatus,
} from '../../graphql/squads';

interface UseSquadPendingPosts {
  data: SourcePostModeration[];
}

export const useSquadPendingPosts = (): UseSquadPendingPosts => {
  return {
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
