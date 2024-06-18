import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { AllFeedPages, OtherFeedPage } from '../lib/query';
import { SharedFeedPage } from '../components/utilities';
import { useViewSize, ViewSize } from './useViewSize';

export interface UseActiveNav {
  home: boolean;
  profile: boolean;
  bookmarks: boolean;
  notifications: boolean;
  search: boolean;
  squads: boolean;
}

export default function useActiveNav(activeFeed: AllFeedPages): UseActiveNav {
  const router = useRouter();
  const isLaptop = useViewSize(ViewSize.Laptop);

  const isHomeActive = useMemo(() => {
    const homePages = [
      SharedFeedPage.MyFeed,
      SharedFeedPage.Popular,
      SharedFeedPage.Upvoted,
      SharedFeedPage.Discussed,
      OtherFeedPage.History,
      SharedFeedPage.Custom,
      SharedFeedPage.CustomForm,
      SharedFeedPage.Explore,
      SharedFeedPage.ExploreLatest,
      SharedFeedPage.ExploreUpvoted,
      SharedFeedPage.ExploreDiscussed,
      OtherFeedPage.Tags,
      OtherFeedPage.Sources,
      OtherFeedPage.Leaderboard,
      'users',
    ];

    if (!isLaptop) {
      homePages.push(OtherFeedPage.Bookmarks, OtherFeedPage.Notifications);
    }

    if (homePages.includes(activeFeed)) {
      return true;
    }

    return router?.route?.startsWith('/posts/[id]'); // if post page the [id] was expected
  }, [activeFeed, isLaptop, router?.route]);

  const isProfileActive = router.pathname?.includes('/[userId]');
  const isSearchActive = activeFeed === SharedFeedPage.Search;
  const isBookmarksActive = activeFeed === OtherFeedPage.Bookmarks;
  const isNotificationsActive = activeFeed === OtherFeedPage.Notifications;
  const isSquadActive = activeFeed === OtherFeedPage.Squad;

  return {
    home: isHomeActive,
    profile: isProfileActive,
    bookmarks: isBookmarksActive,
    notifications: isNotificationsActive,
    search: isSearchActive,
    squads: isSquadActive,
  };
}
