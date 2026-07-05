import type { Post } from '../../graphql/posts';
import { UserVote } from '../../graphql/posts';
import type { UseVotePostProps } from '../../hooks/vote/types';
import { voteMutationHandlers } from '../../hooks/vote/types';
import type { UseBookmarkPostProps } from '../../hooks/useBookmarkPost';

/**
 * Patches a single post (by id) inside a daily query cache. The daily feed and
 * headlines queries aren't the caches the vote/bookmark hooks update by default,
 * so each feature supplies its own updater and we reuse the standard
 * `voteMutationHandlers` deltas to keep counts + state optimistic (and
 * reversible on error), exactly like the feed cards do.
 */
export type UpdateDailyPost = (
  id: string,
  manipulate: (post: Post) => Partial<Post>,
) => void;

export const createVoteOnMutate =
  (updatePost: UpdateDailyPost): UseVotePostProps['onMutate'] =>
  ({ id, vote }) => {
    const mutationHandler = voteMutationHandlers[vote];

    if (!mutationHandler) {
      return undefined;
    }

    let previousVote = UserVote.None;
    updatePost(id, (post) => {
      previousVote = post.userState?.vote ?? UserVote.None;
      return mutationHandler(post) as Partial<Post>;
    });

    return () => {
      const rollbackHandler = voteMutationHandlers[previousVote];

      if (rollbackHandler) {
        updatePost(id, (post) => rollbackHandler(post) as Partial<Post>);
      }
    };
  };

export const createBookmarkOnMutate =
  (updatePost: UpdateDailyPost): UseBookmarkPostProps['onMutate'] =>
  ({ id }) => {
    if (!id) {
      return undefined;
    }

    let previousBookmarked = false;
    updatePost(id, (post) => {
      previousBookmarked = !!post.bookmarked;
      return { bookmarked: !post.bookmarked };
    });

    return () => {
      updatePost(id, () => ({ bookmarked: previousBookmarked }));
    };
  };
