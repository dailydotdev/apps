import { useContext, useMemo } from 'react';
import { useQuery } from 'react-query';
import AlertContext from '../contexts/AlertContext';
import AuthContext from '../contexts/AuthContext';
import { getLatestChangelogPost, Post } from '../graphql/posts';
import useSidebarRendered from './useSidebarRendered';

type UseChangelog = {
  isAvailable: boolean;
  latestPost?: Post;
  dismiss: () => Promise<void>;
};

export function useChangelog(): UseChangelog {
  const { alerts, updateAlerts } = useContext(AlertContext);
  const { user } = useContext(AuthContext);
  const { sidebarRendered } = useSidebarRendered();

  const { data: latestPost } = useQuery(
    ['changelog', 'latest-post', { loggedIn: !!user?.id }] as const,
    async ({ queryKey }) => {
      const [, , variables] = queryKey;

      return getLatestChangelogPost(variables.loggedIn);
    },
    {
      enabled: sidebarRendered,
    },
  );
  const isAvailable = useMemo(() => {
    if (!sidebarRendered) {
      return false;
    }

    if (!latestPost) {
      return false;
    }

    return alerts.changelog || false;
  }, [alerts.changelog, latestPost, sidebarRendered]);

  const dismiss = async () => {
    const currentDate = new Date();

    await updateAlerts({
      lastChangelog: currentDate.toISOString(),
    });
  };

  return {
    isAvailable,
    latestPost,
    dismiss,
  };
}
