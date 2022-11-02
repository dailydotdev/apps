import { useEffect } from 'react';
import { MainFeedPage } from '../components/utilities';
import usePersistentContext from './usePersistentContext';

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

export default function useDefaultFeed(hasUser: boolean, feed: string): string {
  const isMyFeed = feed === MainFeedPage.MyFeed;
  const [defaultFeed, updateDefaultFeed] = usePersistentContext(
    'defaultFeed',
    'my-feed',
    ['my-feed', 'popular', 'upvoted', 'discussed'],
  );
  const feedName = feed === 'default' ? defaultFeed : feed;

  useEffect(() => {
    if (
      defaultFeed !== null &&
      feed !== null &&
      feed !== defaultFeed &&
      !getShouldRedirect(isMyFeed, !!hasUser)
    ) {
      updateDefaultFeed(feed);
    }
  }, [defaultFeed, feed]);

  return feedName;
}
