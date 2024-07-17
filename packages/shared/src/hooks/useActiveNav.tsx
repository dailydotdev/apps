import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { AllFeedPages, OtherFeedPage } from '../lib/query';
import { SharedFeedPage } from '../components/utilities';
import { useViewSize, ViewSize } from './useViewSize';
import { feature } from '../lib/featureManagement';
import { useConditionalFeature } from './useConditionalFeature';

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
  const isMobile = useViewSize(ViewSize.MobileL);
  const { value: mobileExploreTab } = useConditionalFeature({
    feature: feature.mobileExploreTab,
    shouldEvaluate: !isLaptop,
  });
  const isHomeActive = useMemo(() => {
    const homePages = [
      SharedFeedPage.MyFeed,
      SharedFeedPage.Popular,
      SharedFeedPage.Upvoted,
      SharedFeedPage.Discussed,
      OtherFeedPage.History,
      SharedFeedPage.Custom,
      SharedFeedPage.CustomForm,
      OtherFeedPage.Tags,
      OtherFeedPage.Sources,
      OtherFeedPage.Leaderboard,
    ];
    if (!mobileExploreTab) {
      homePages.push(
        OtherFeedPage.Explore,
        OtherFeedPage.ExploreLatest,
        OtherFeedPage.ExploreUpvoted,
        OtherFeedPage.ExploreDiscussed,
      );
    }

    if (!isLaptop) {
      homePages.push(OtherFeedPage.Bookmarks);
      if (!isMobile) {
        homePages.push(OtherFeedPage.Notifications);
      }
    }

    if (homePages.includes(activeFeed)) {
      return true;
    }

    return router?.route?.startsWith('/posts/[id]'); // if post page the [id] was expected
  }, [activeFeed, isLaptop, isMobile, mobileExploreTab, router?.route]);

  const searchPages: AllFeedPages[] = [SharedFeedPage.Search];
  if (mobileExploreTab) {
    searchPages.push(
      OtherFeedPage.Explore,
      OtherFeedPage.ExploreLatest,
      OtherFeedPage.ExploreUpvoted,
      OtherFeedPage.ExploreDiscussed,
    );
  }

  const isProfileActive = router.pathname?.includes('/[userId]');
  const isSearchActive = searchPages.includes(activeFeed);
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
