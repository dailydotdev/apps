import { useContext, useMemo } from 'react';
import { useQuery } from 'react-query';
import AlertContext from '../contexts/AlertContext';
import AuthContext from '../contexts/AuthContext';
import { getLatestChangelogPost, Post } from '../graphql/posts';
import { laptop } from '../styles/media';
import useMedia from './useMedia';

type UseChangelog = {
  isAvailable: boolean;
  latestPost?: Post;
  dismiss: () => Promise<void>;
};

export function useChangelog(): UseChangelog {
  const { alerts, updateAlerts } = useContext(AlertContext);
  const { user } = useContext(AuthContext);
  const isDesktop = useMedia([laptop.replace('@media ', '')], [true], false);

  const { data: latestPost } = useQuery(
    ['changelog', 'latest-post', { loggedIn: !!user?.id }] as const,
    async ({ queryKey }) => {
      const [, , variables] = queryKey;

      return getLatestChangelogPost(variables.loggedIn);
    },
    {
      enabled: isDesktop,
    },
  );
  const isAvailable = useMemo(() => {
    if (!isDesktop) {
      return false;
    }

    const lastChangelogDate = Date.parse(alerts?.lastChangelog);
    const lastPostDate = Date.parse(latestPost?.createdAt);

    if (Number.isNaN(lastChangelogDate) || Number.isNaN(lastPostDate)) {
      return false;
    }

    return lastPostDate > lastChangelogDate;
  }, [alerts.lastChangelog, latestPost?.createdAt, isDesktop]);

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
