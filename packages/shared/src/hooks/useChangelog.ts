import { useContext, useMemo } from 'react';
import { useMutation, useQuery } from 'react-query';
import AlertContext from '../contexts/AlertContext';
import { getLatestChangelogPost, Post } from '../graphql/posts';
import useSidebarRendered from './useSidebarRendered';

type UseChangelog = {
  isAvailable: boolean;
  latestPost?: Post;
  dismiss: () => Promise<void>;
};

export function useChangelog(): UseChangelog {
  const { alerts, updateAlerts } = useContext(AlertContext);
  const { sidebarRendered } = useSidebarRendered();

  const { data: latestPost } = useQuery(
    ['changelog', 'latest-post'] as const,
    async () => {
      return getLatestChangelogPost();
    },
    {
      enabled: sidebarRendered && !!alerts.changelog,
    },
  );

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
  };
}
