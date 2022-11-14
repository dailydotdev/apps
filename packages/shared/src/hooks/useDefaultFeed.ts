import { useEffect, useMemo } from 'react';
import { MainFeedPage } from '../components/utilities';
import usePersistentContext from './usePersistentContext';

interface UseDefaultFeedProps {
  hasFiltered?: boolean;
  hasUser?: boolean;
  feed?: string;
}

export const getShouldRedirect = (
  isOnMyFeed: boolean,
  isLoggedIn: boolean,
): boolean => {
  if (!isOnMyFeed) {
    return false;
  }

  if (!isLoggedIn) {
    return true;
  }

  return false;
};

export default function useDefaultFeed({
  hasFiltered,
  hasUser,
  feed,
}: UseDefaultFeedProps = {}): string {
  const feedName = feed?.replaceAll?.('/', '');
  const isMyFeed = feedName === MainFeedPage.MyFeed;
  const [defaultFeed, updateDefaultFeed] = usePersistentContext(
    'defaultFeed',
    !hasUser || !hasFiltered ? 'popular' : 'my-feed',
    ['my-feed', 'popular', 'upvoted', 'discussed'],
    !hasUser || !hasFiltered ? 'popular' : 'my-feed',
  );

  useEffect(() => {
    const feedConditions = [null, defaultFeed, 'default', '/', ''];
    if (
      defaultFeed !== null &&
      feedConditions.every((condition) => condition !== feedName) &&
      !getShouldRedirect(isMyFeed, !!hasUser)
    ) {
      updateDefaultFeed(feedName);
    }
  }, [defaultFeed, feed]);

  return useMemo(() => defaultFeed, [defaultFeed, hasFiltered, hasUser, feed]);
}
