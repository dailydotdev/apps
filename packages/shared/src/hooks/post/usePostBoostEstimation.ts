import { useMemo, useState } from 'react';
import type { StartCampaignProps } from '../../graphql/post/boost';
import { CampaignType } from '../../graphql/post/boost';
import type { Post } from '../../graphql/posts';
import { briefRefetchIntervalMs, defautRefetchMs } from '../../graphql/posts';
import { oneMinute } from '../../lib/dateFormat';
import { usePostById } from '../usePostById';
import { isOlderThan } from '../../lib/date';
import { useCampaignEstimation } from '../../features/boost/useCampaignEstimation';

interface UsePostBoostEstimationProps {
  post: Post;
  query: Omit<StartCampaignProps, 'value' | 'type'>;
}

export const usePostBoostEstimation = ({
  post: postFromProps,
  query,
}: UsePostBoostEstimationProps) => {
  const isOldPost = useMemo(
    () => isOlderThan(oneMinute * 5, new Date(postFromProps.createdAt)),
    [postFromProps.createdAt],
  );
  const [retriesExhausted, setRetriesExhausted] = useState(false);
  const [post, setPost] = useState(postFromProps);
  const hasTags = !!post.tags?.length || !!post.sharedPost?.tags?.length;
  const canBoost =
    isOldPost || hasTags || !!post.yggdrasilId || retriesExhausted;
  const { estimatedReach, isLoading } = useCampaignEstimation({
    type: CampaignType.Post,
    query,
    referenceId: post.id,
    enabled: canBoost,
  });

  usePostById({
    id: post.id,
    options: {
      enabled: !canBoost,
      refetchInterval: (cache) => {
        const retries = Math.max(
          cache.state.dataUpdateCount,
          cache.state.fetchFailureCount,
        );

        // 30 seconds is an ample time to process yggdrasil
        const oneMinuteMs = oneMinute * 1000;
        const maxRetries = oneMinuteMs / 2 / defautRefetchMs;

        if (retries > maxRetries) {
          setRetriesExhausted(true);
          return false;
        }

        const { data } = cache.state;

        // in case of query error keep refetching until maxRetries is reached
        if (data?.post.yggdrasilId) {
          setPost(data.post);
          return false;
        }

        return briefRefetchIntervalMs;
      },
    },
  });

  return { estimatedReach, isLoading, canBoost };
};
