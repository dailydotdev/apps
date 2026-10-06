const seeAllPosts = 'See all posts';
const seeAllSquads = 'See all squads';
const seeFullProfile = 'See full profile';

const titleByRoute: Record<string, string> = {
  '/posts': seeAllPosts,
  '/posts/latest': seeAllPosts,
  '/posts/upvoted': seeAllPosts,
  '/posts/discussed': seeAllPosts,
  '/popular': seeAllPosts,
  '/upvoted': seeAllPosts,
  '/discussed': seeAllPosts,
  '/highlights': seeAllPosts,
  '/highlights/[channel]': seeAllPosts,
  '/highlights/all': seeAllPosts,
  '/posts/best-of': seeAllPosts,
  '/posts/best-of/[year]': seeAllPosts,
  '/posts/best-of/[year]/[month]': seeAllPosts,
  '/tags/[tag]/best-of': seeAllPosts,
  '/tags/[tag]/best-of/[year]': seeAllPosts,
  '/tags/[tag]/best-of/[year]/[month]': seeAllPosts,
  '/sources/[source]/best-of': seeAllPosts,
  '/sources/[source]/best-of/[year]': seeAllPosts,
  '/sources/[source]/best-of/[year]/[month]': seeAllPosts,
  '/posts/[id]': seeAllPosts,
  '/tags': 'See all tags',
  '/tags/[tag]': seeAllPosts,
  '/sources': 'See all sources',
  '/sources/[source]': seeAllPosts,
  '/squads/discover': seeAllSquads,
  '/squads/discover/featured': seeAllSquads,
  '/squads/discover/[id]': seeAllSquads,
  '/squads/[handle]': 'See full squad',
  '/[userId]': seeFullProfile,
  '/[userId]/posts': seeFullProfile,
  '/[userId]/upvoted': seeFullProfile,
  '/users': 'See full leaderboard',
  '/search/posts': seeAllPosts,
  '/tools': seeAllPosts,
  '/tools/[slug]': seeAllPosts,
};

// Shared by the footer and the page spacer under it, so the end of the page
// always scrolls clear of the footer.
export const mobileAppFooterHeight =
  'h-[calc(9.5rem_+_max(env(safe-area-inset-bottom),1.5rem))]';

export const getMobileAppFooterTitle = (pathname: string): string | undefined =>
  titleByRoute[pathname];

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
