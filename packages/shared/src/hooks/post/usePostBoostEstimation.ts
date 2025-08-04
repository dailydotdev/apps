import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import user from '../../../__tests__/fixture/loggedUser';
import type { EstimatedReachProps } from '../../graphql/post/boost';
import { getBoostEstimatedReachDaily } from '../../graphql/post/boost';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import type { Post } from '../../graphql/posts';
import { briefRefetchIntervalMs, defautRefetchMs } from '../../graphql/posts';
import { oneMinute } from '../../lib/dateFormat';
import { usePostById } from '../usePostById';

interface UsePostBoostEstimationProps {
  post: Post;
  query: Omit<EstimatedReachProps, 'id'>;
}

const placeholderData = { min: 0, max: 0 };

export const usePostBoostEstimation = ({
  post: postFromProps,
  query,
}: UsePostBoostEstimationProps) => {
  const [retriesExhausted, setRetriesExhausted] = useState(false);
  const [post, setPost] = useState(postFromProps);
  const hasTags = !!post.tags?.length || !!post.sharedPost?.tags?.length;
  const queryKey = generateQueryKey(
    RequestKey.PostCampaigns,
    user,
    'estimate',
    post.id,
    Object.values(query).join(':'),
  );
  const canBoost = hasTags || !!post.yggdrasilId || retriesExhausted;
  const {
    data: estimatedReach,
    isPending,
    isRefetching,
  } = useQuery({
    queryKey,
    queryFn: () =>
      getBoostEstimatedReachDaily({
        id: post.id,
        budget: query.budget,
        duration: query.duration,
      }),
    enabled: !!canBoost,
    placeholderData,
    staleTime: StaleTime.Default,
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

  return { estimatedReach, isLoading: isPending || isRefetching, canBoost };
};
