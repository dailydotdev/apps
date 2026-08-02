import { useCallback } from 'react';
import type { InfiniteData } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Connection } from '../../../graphql/common';
import type { ScheduledPost } from '../../../graphql/posts';
import { deletePost } from '../../../graphql/posts';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { PromptOptions } from '../../../hooks/usePrompt';
import { usePrompt } from '../../../hooks/usePrompt';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { labels } from '../../../lib/labels';
import { ButtonColor, ButtonVariant } from '../../buttons/Button';

const deletePromptOptions: PromptOptions = {
  title: 'Delete scheduled post?',
  description:
    'Are you sure you want to delete this scheduled post? It will never go live and this action cannot be undone.',
  okButton: {
    title: 'Delete',
    variant: ButtonVariant.Primary,
    color: ButtonColor.Cabbage,
  },
};

export interface UseDeleteScheduledPost {
  deleteScheduledPost: (id: string) => Promise<void>;
  isDeleting: boolean;
}

export const useDeleteScheduledPost = (): UseDeleteScheduledPost => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const { showPrompt } = usePrompt();
  const { displayToast } = useToastNotification();

  const { mutate, isPending } = useMutation({
    mutationFn: deletePost,
    onSuccess: (_, id) => {
      client.setQueryData<InfiniteData<Connection<ScheduledPost>>>(
        generateQueryKey(RequestKey.ScheduledPosts, user),
        (data) => {
          if (!data) {
            return data;
          }

          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              edges: page.edges.filter(({ node }) => node.id !== id),
            })),
          };
        },
      );
      displayToast('Scheduled post deleted');
    },
    onError: () => displayToast(labels.error.generic),
  });

  const deleteScheduledPost = useCallback(
    async (id: string) => {
      if (!(await showPrompt(deletePromptOptions))) {
        return;
      }

      mutate(id);
    },
    [mutate, showPrompt],
  );

  return { deleteScheduledPost, isDeleting: isPending };
};
