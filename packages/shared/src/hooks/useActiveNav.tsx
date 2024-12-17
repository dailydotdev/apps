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
  explore: boolean;
  squads: boolean;
}

export default function useActiveNav(activeFeed: AllFeedPages): UseActiveNav {
  const router = useRouter();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isMobile = useViewSize(ViewSize.MobileL);
  const isHomeActive = useMemo(() => {
    const homePages = [
      SharedFeedPage.MyFeed,
      SharedFeedPage.Popular,
      SharedFeedPage.Upvoted,
      OtherFeedPage.Discussed,
      OtherFeedPage.History,
      SharedFeedPage.Custom,
      SharedFeedPage.CustomForm,
      OtherFeedPage.Tags,
      OtherFeedPage.Sources,
      OtherFeedPage.Leaderboard,
      OtherFeedPage.Following,
    ];

    if (!isLaptop) {
      homePages.push(
        OtherFeedPage.Bookmarks,
        OtherFeedPage.BookmarkFolder,
        OtherFeedPage.BookmarkLater,
      );
      if (!isMobile) {
        homePages.push(OtherFeedPage.Notifications);
      }
    }

    if (homePages.includes(activeFeed)) {
      return true;
    }

    return router?.route?.startsWith('/posts/[id]'); // if post page the [id] was expected
  }, [activeFeed, isLaptop, isMobile, router?.route]);

  const explorePages: AllFeedPages[] = [
    SharedFeedPage.Search,
    OtherFeedPage.Explore,
    OtherFeedPage.ExploreLatest,
    OtherFeedPage.ExploreUpvoted,
    OtherFeedPage.ExploreDiscussed,
  ];
  const isProfileActive = router.pathname?.includes('/[userId]');
  const isExploreActive = explorePages.includes(activeFeed);
  const bookmarksPages: AllFeedPages[] = [
    OtherFeedPage.Bookmarks,
    OtherFeedPage.BookmarkLater,
    OtherFeedPage.BookmarkFolder,
  ];
  const isBookmarksActive = bookmarksPages.includes(activeFeed);
  const isNotificationsActive = activeFeed === OtherFeedPage.Notifications;
  const isSquadsActive = activeFeed.includes(OtherFeedPage.Squad);

  return {
    home: isHomeActive,
    profile: isProfileActive,
    bookmarks: isBookmarksActive,
    notifications: isNotificationsActive,
    explore: isExploreActive,
    squads: isSquadsActive,
  };
}
