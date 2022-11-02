import { useEffect } from 'react';
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
  const isMyFeed = feed === MainFeedPage.MyFeed;
  const [defaultFeed, updateDefaultFeed] = usePersistentContext(
    'defaultFeed',
    !hasUser || !hasFiltered ? 'popular' : 'my-feed',
    ['my-feed', 'popular', 'upvoted', 'discussed'],
    !hasUser || !hasFiltered ? 'popular' : 'my-feed',
  );

  useEffect(() => {
    if (
      defaultFeed !== null &&
      feed !== null &&
      feed !== defaultFeed &&
      feed !== 'default' &&
      !getShouldRedirect(isMyFeed, !!hasUser)
    ) {
      updateDefaultFeed(feed);
    }
  }, [defaultFeed, feed]);

  return defaultFeed;
}
