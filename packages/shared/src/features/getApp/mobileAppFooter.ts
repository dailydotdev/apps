export enum MobileAppFooterTrigger {
  // An anchor placed in the page content scrolls into view.
  Anchor = 'anchor',
  // The reader scrolls down past the first screen, then back up.
  ScrollUp = 'scroll_up',
  // The reader runs a third distinct search in the session.
  ThirdQuery = 'third_query',
}

// Where a page's anchor lives. Shared components carry anchors onto other
// pages (post comments render in the reader modal over a feed), so each one
// only counts on the page that asked for it.
export enum MobileAppFooterAnchorPlace {
  Feed = 'feed',
  Comments = 'comments',
  Headlines = 'headlines',
  Activity = 'activity',
  Leaderboard = 'leaderboard',
}

export interface MobileAppFooterMoment {
  title: string;
  trigger: MobileAppFooterTrigger;
  anchorAt?: MobileAppFooterAnchorPlace;
  // Feed pages place the anchor before this card.
  feedAnchorIndex?: number;
}

const atAnchor = (
  title: string,
  anchorAt: MobileAppFooterAnchorPlace,
): MobileAppFooterMoment => ({
  title,
  trigger: MobileAppFooterTrigger.Anchor,
  anchorAt,
});

const atFeedCard = (
  title: string,
  feedAnchorIndex: number,
): MobileAppFooterMoment => ({
  ...atAnchor(title, MobileAppFooterAnchorPlace.Feed),
  feedAnchorIndex,
});

const onScrollUp = (title: string): MobileAppFooterMoment => ({
  title,
  trigger: MobileAppFooterTrigger.ScrollUp,
});

const seeAllPosts = 'See all posts';
const explore = atFeedCard(seeAllPosts, 12);
const headlines = atAnchor(seeAllPosts, MobileAppFooterAnchorPlace.Headlines);
const bestOf = onScrollUp(seeAllPosts);
const squads = onScrollUp('See all squads');
const profileFeed = atFeedCard('See full profile', 1);

const momentByRoute: Record<string, MobileAppFooterMoment> = {
  '/posts': explore,
  '/posts/latest': explore,
  '/posts/upvoted': explore,
  '/posts/discussed': explore,
  '/popular': explore,
  '/upvoted': explore,
  '/discussed': explore,
  '/explore/[tag]': explore,
  '/highlights': headlines,
  '/highlights/[channel]': headlines,
  '/highlights/all': headlines,
  '/posts/best-of': bestOf,
  '/posts/best-of/[year]': bestOf,
  '/posts/best-of/[year]/[month]': bestOf,
  '/tags/[tag]/best-of': bestOf,
  '/tags/[tag]/best-of/[year]': bestOf,
  '/tags/[tag]/best-of/[year]/[month]': bestOf,
  '/sources/[source]/best-of': bestOf,
  '/sources/[source]/best-of/[year]': bestOf,
  '/sources/[source]/best-of/[year]/[month]': bestOf,
  '/posts/[id]': atAnchor(
    'See all comments',
    MobileAppFooterAnchorPlace.Comments,
  ),
  '/tags': onScrollUp('See all tags'),
  '/tags/[tag]': atFeedCard(seeAllPosts, 1),
  '/sources': onScrollUp('See all sources'),
  '/sources/[source]': atFeedCard(seeAllPosts, 0),
  '/squads/discover': squads,
  '/squads/discover/featured': squads,
  '/squads/discover/[id]': squads,
  '/squads/[handle]': atFeedCard('See full squad', 1),
  '/[userId]': atAnchor(
    'See full profile',
    MobileAppFooterAnchorPlace.Activity,
  ),
  '/[userId]/posts': profileFeed,
  '/[userId]/upvoted': profileFeed,
  '/users': atAnchor(
    'See full leaderboard',
    MobileAppFooterAnchorPlace.Leaderboard,
  ),
  '/search/posts': {
    title: seeAllPosts,
    trigger: MobileAppFooterTrigger.ThirdQuery,
  },
  '/tools': onScrollUp(seeAllPosts),
  '/tools/[slug]': onScrollUp(seeAllPosts),
};

// Shared by the footer and the page spacer under it, so the end of the page
// always scrolls clear of the footer.
export const mobileAppFooterHeight =
  'h-[calc(17.125rem_+_max(env(safe-area-inset-bottom),1.5rem))]';

export const getMobileAppFooterMoment = (
  pathname: string,
): MobileAppFooterMoment | undefined => momentByRoute[pathname];

const searchEngineHost =
  /(^|\.)(google|bing|duckduckgo|yahoo|yandex|baidu|ecosia|search\.brave)\./;

let landing: { path: string; fromSearch: boolean } | undefined;

const currentPath = (): string =>
  `${window.location.pathname}${window.location.search}`;

// Google demotes pages covered by an interstitial right after a search
// click, so the page a search engine sent the reader to stays clean.
export const isSearchEngineLanding = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  if (!landing) {
    let fromSearch = false;
    try {
      fromSearch = searchEngineHost.test(new URL(document.referrer).hostname);
    } catch {
      fromSearch = false;
    }
    landing = { path: currentPath(), fromSearch };
  }

  return landing.fromSearch && landing.path === currentPath();
};
