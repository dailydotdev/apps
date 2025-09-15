import type { InfiniteData } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FeedData, Post } from '../graphql/posts';
import { votePoll } from '../graphql/posts';
import {
  findIndexOfPostInData,
  updateCachedPagePost,
  updatePostCache,
} from '../lib/query';
import { useActiveFeedContext } from '../contexts';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent } from '../lib/log';

const usePoll = ({ post }: { post: Post }) => {
  const { logEvent } = useLogContext();
  const { queryKey } = useActiveFeedContext();
  const queryClient = useQueryClient();

  const { mutate, isPending: isCastingVote } = useMutation({
    mutationFn: (optionId: string) =>
      votePoll({ postId: post.id, optionId, sourceId: post.source?.id }),
    onSuccess: (data: Post) => {
      updatePostCache(queryClient, post.id, data);
      const updateFeed = updateCachedPagePost(queryKey, queryClient);
      const feedData =
        queryClient.getQueryData<InfiniteData<FeedData>>(queryKey);

      const { pageIndex, index } = findIndexOfPostInData(
        feedData,
        post.id,
        false,
      );
      updateFeed(pageIndex, index, data);
    },
  });

  const onVote = (optionId: string) => {
    mutate(optionId);
    logEvent({
      event_name: LogEvent.VotePoll,
      extra: JSON.stringify({ vote: optionId }),
    });
  };

  return { onVote, isCastingVote };
};

export default usePoll;
