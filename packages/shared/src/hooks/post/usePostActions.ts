import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import type { Post } from '../../graphql/posts';
import { generateQueryKey, RequestKey } from '../../lib/query';

type PostActionData = {
  interaction: 'upvote' | 'bookmark' | 'copy' | undefined;
};

type UsePostActions = PostActionData & {
  onInteract: (interaction?: PostActionData['interaction']) => void;
};

export const usePostActions = (post: Post): UsePostActions => {
  const client = useQueryClient();
  const key = useMemo(() => {
    return generateQueryKey(RequestKey.PostActions, { id: post.id });
  }, [post.id]);
  const data = client.getQueryData<PostActionData>(key);

  const onInteract = useCallback(
    (interaction?: PostActionData['interaction']) => {
      client.setQueryData<PostActionData>(key, {
        interaction,
      });
    },
    [client, key],
  );

  return {
    interaction: data?.interaction,
    onInteract,
  };
};
