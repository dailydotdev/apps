import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { AllFeedPages, OtherFeedPage } from '../lib/query';
import { SharedFeedPage } from '../components/utilities';

export default function useActiveNav(activeFeed: AllFeedPages): {
  home: boolean;
  profile: boolean;
  search: boolean;
  squads: boolean;
} {
  const router = useRouter();

  const isHomeActive = useMemo(() => {
    return [
      SharedFeedPage.MyFeed,
      SharedFeedPage.Popular,
      SharedFeedPage.Upvoted,
      SharedFeedPage.Discussed,
      OtherFeedPage.Bookmarks,
      OtherFeedPage.History,
      OtherFeedPage.Notifications,
    ].includes(activeFeed);
  }, [activeFeed]);

  const isProfileActive = router.pathname?.includes('/[userId]');
  const isSearchActive = activeFeed === SharedFeedPage.Search;
  const isSquadActive = activeFeed === OtherFeedPage.Squad;

  return {
    home: isHomeActive,
    profile: isProfileActive,
    search: isSearchActive,
    squads: isSquadActive,
  };
}
