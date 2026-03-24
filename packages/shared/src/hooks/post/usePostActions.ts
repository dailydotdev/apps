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

const defaultPostActionData: PostActionData = {
  interaction: 'none',
  previousInteraction: 'none',
};

export const usePostActions = ({ post }: { post?: Post }): UsePostActions => {
  const client = useQueryClient();
  const postId = post?.id;
  const key = useMemo(() => {
    if (!postId) {
      return [RequestKey.PostActions, 'missing-post'];
    }

    return generateQueryKey(RequestKey.PostActions, { id: postId });
  }, [postId]);

  const queryFn = useCallback((): PostActionData => {
    return defaultPostActionData;
  }, []);

  const { data } = useQuery({
    queryKey: key,
    queryFn,
    initialData: queryFn,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!postId,
    ...disabledRefetch,
  });
  const actionData = data ?? queryFn();

  const onInteract = useCallback(
    (interaction: PostActionData['interaction']) => {
      if (!postId) {
        return;
      }

      client.setQueryData<PostActionData>(key, {
        interaction,
        previousInteraction:
          actionData.interaction === interaction
            ? 'none'
            : actionData.interaction,
      });
    },
    [client, key, actionData.interaction, postId],
  );

  return {
    interaction: actionData.interaction,
    previousInteraction: actionData.previousInteraction,
    onInteract,
  };
};
