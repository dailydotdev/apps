import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import type { Post } from '../../graphql/posts';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { disabledRefetch } from '../../lib/func';

type Interaction = 'upvote' | 'bookmark' | 'copy' | 'none';

type PostActionData = {
  interaction: Interaction;
  previousInteraction: Interaction;
};

type UsePostActions = PostActionData & {
  onInteract: (interaction: PostActionData['interaction']) => void;
};

export const usePostActions = ({ post }: { post?: Post }): UsePostActions => {
  const client = useQueryClient();
  const postId = post?.id ?? 'missing-post';
  const key = useMemo(() => {
    return generateQueryKey(RequestKey.PostActions, { id: postId });
  }, [postId]);

  const queryFn = useCallback((): PostActionData => {
    return {
      interaction: 'none',
      previousInteraction: 'none',
    };
  }, []);

  const { data } = useQuery({
    queryKey: key,
    queryFn,
    initialData: queryFn,
    staleTime: Infinity,
    gcTime: Infinity,
    ...disabledRefetch,
  });
  const actionData = data ?? queryFn();

  const onInteract = useCallback(
    (interaction: PostActionData['interaction']) => {
      client.setQueryData<PostActionData>(key, {
        interaction,
        previousInteraction:
          actionData.interaction === interaction ? 'none' : actionData.interaction,
      });
    },
    [client, key, actionData.interaction],
  );

  return {
    interaction: actionData.interaction,
    previousInteraction: actionData.previousInteraction,
    onInteract,
  };
};
