import { useContext, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AlertContext from '../contexts/AlertContext';
import { getLatestChangelogPost, Post } from '../graphql/posts';
import useSidebarRendered from './useSidebarRendered';
import { UseVotePost, useVotePost, voteMutationHandlers } from './vote';
import { generateQueryKey, RequestKey } from '../lib/query';
import { useAuthContext } from '../contexts/AuthContext';

type UseChangelog = {
  isAvailable: boolean;
  latestPost?: Post;
  dismiss: () => Promise<void>;
  toggleUpvote: UseVotePost['toggleUpvote'];
};

export function useChangelog(): UseChangelog {
  const { alerts, updateAlerts } = useContext(AlertContext);
  const { sidebarRendered } = useSidebarRendered();
  const client = useQueryClient();
  const { user } = useAuthContext();
  const changelogQueryKey = generateQueryKey(
    RequestKey.Changelog,
    user,
    'latest-post',
  );

  const { data: latestPost } = useQuery(
    changelogQueryKey,
    getLatestChangelogPost,
    {
      enabled: sidebarRendered && !!alerts.changelog,
    },
  );

  const updateLatestChangelogPostCache = (mutationHandler) => {
    return client.setQueryData(changelogQueryKey, (old: Post) => {
      return {
        ...old,
        ...mutationHandler(old),
      };
    });
  };

  const { toggleUpvote } = useVotePost({
    onMutate: ({ vote }) => {
      const mutationHandler = voteMutationHandlers[vote];

      if (!mutationHandler) {
        return undefined;
      }

      const previousVote =
        client.getQueryData<Post>(changelogQueryKey)?.userState?.vote;

      updateLatestChangelogPostCache(mutationHandler);
      return () => {
        const rollbackMutationHandler = voteMutationHandlers[previousVote];

        if (!rollbackMutationHandler) {
          return;
        }

        updateLatestChangelogPostCache(rollbackMutationHandler);
      };
    },
  });

  const isAvailable = useMemo(() => {
    if (!sidebarRendered) {
      return false;
    }

    const lastChangelogDate = Date.parse(alerts?.lastChangelog);
    const lastPostDate = Date.parse(latestPost?.createdAt);

    if (Number.isNaN(lastChangelogDate) || Number.isNaN(lastPostDate)) {
      return false;
    }

    return lastPostDate > lastChangelogDate;
  }, [alerts.lastChangelog, latestPost?.createdAt, sidebarRendered]);

  const dismissMutation = useMutation(() => {
    const currentDate = new Date();

    return updateAlerts({
      lastChangelog: currentDate.toISOString(),
    });
  });

  const dismiss = async () => {
    if (dismissMutation.isLoading) {
      return;
    }

    await dismissMutation.mutateAsync();
  };

  return {
    isAvailable,
    latestPost,
    dismiss,
    toggleUpvote,
  };
}
