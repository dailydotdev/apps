import { useQuery, useQueryClient } from '@tanstack/react-query';
import { gqlClient } from '../../graphql/common';
import { POST_FETCH_SMART_TITLE_QUERY, type Post } from '../../graphql/posts';
import { getPostByIdKey } from '../usePostById';
import { usePlusSubscription } from '../usePlusSubscription';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey } from '../../lib/query';

type UseSmartTitle = {
  // fetchSmartTitle: () => Promise<QueryObserverResult<string, Error>>;
  fetchSmartTitle: (callback?: () => void | Promise<void>) => Promise<void>;
  usedTrial: boolean;
  title: string;
};

export const useSmartTitle = (post: Post): UseSmartTitle => {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { isPlus, showPlusSubscription } = usePlusSubscription();
  const key = [...getPostByIdKey(post?.id), 'title'];
  const trialKey = generateQueryKey(
    RequestKey.UsedSmartTitleTrial,
    user,
    ...getPostByIdKey(post?.id),
  );

  const { data: title, refetch } = useQuery({
    queryKey: key,
    queryFn: async () => {
      // Enusre that we don't accidentally fetch the smart title for users outside of the feature flag
      if (!showPlusSubscription) {
        return post?.title || post?.sharedPost?.title;
      }

      const data = await gqlClient.request<{
        fetchSmartTitle: { title: string };
      }>(POST_FETCH_SMART_TITLE_QUERY, {
        id: post?.id,
      });

      if (!isPlus) {
        client.setQueryData(trialKey, true);
      }

      return data.fetchSmartTitle.title;
    },
    enabled: false,
    initialData: post?.title || post?.sharedPost?.title,
  });

  const { data: usedTrial } = useQuery({
    queryKey: trialKey,
    queryFn: async () => {
      return false;
    },
    enabled: !isPlus,
    staleTime: Infinity,
  });

  const fetchSmartTitle = async (callback?: () => void | Promise<void>) => {
    await refetch();
    await callback?.();
  };

  return {
    fetchSmartTitle,
    title,
    usedTrial,
  };
};
