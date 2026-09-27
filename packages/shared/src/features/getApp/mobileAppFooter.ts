export enum MobileAppFooterTrigger {
  // An anchor placed in the page content scrolls into view.
  Anchor = 'anchor',
  // The reader scrolls down past the first screen, then back up.
  ScrollUp = 'scroll_up',
  // The reader runs a third distinct search in the session.
  ThirdQuery = 'third_query',
}

export interface MobileAppFooterMoment {
  title: string;
  trigger: MobileAppFooterTrigger;
  // Feed pages place the anchor before this card.
  feedAnchorIndex?: number;
}

const atAnchor = (
  title: string,
  feedAnchorIndex?: number,
): MobileAppFooterMoment => ({
  title,
  trigger: MobileAppFooterTrigger.Anchor,
  feedAnchorIndex,
});

const onScrollUp = (title: string): MobileAppFooterMoment => ({
  title,
  trigger: MobileAppFooterTrigger.ScrollUp,
});

const seeAllPosts = 'See all posts';
const explore = atAnchor(seeAllPosts, 12);
const headlines = atAnchor(seeAllPosts);
const bestOf = onScrollUp(seeAllPosts);
const squads = onScrollUp('See all squads');
const profileFeed = atAnchor('See full profile', 1);

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
  '/posts/[id]': atAnchor('See all comments'),
  '/tags': onScrollUp('See all tags'),
  '/tags/[tag]': atAnchor(seeAllPosts, 1),
  '/sources': onScrollUp('See all sources'),
  '/sources/[source]': atAnchor(seeAllPosts, 0),
  '/squads/discover': squads,
  '/squads/discover/featured': squads,
  '/squads/discover/[id]': squads,
  '/squads/[handle]': atAnchor('See full squad', 1),
  '/[userId]': atAnchor('See full profile'),
  '/[userId]/posts': profileFeed,
  '/[userId]/upvoted': profileFeed,
  '/users': atAnchor('See full leaderboard'),
  '/search/posts': {
    title: seeAllPosts,
    trigger: MobileAppFooterTrigger.ThirdQuery,
  },
  '/tools': onScrollUp(seeAllPosts),
  '/tools/[slug]': onScrollUp(seeAllPosts),
};

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
