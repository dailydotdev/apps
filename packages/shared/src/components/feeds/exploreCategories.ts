import type { Edge } from '../../graphql/common';
import type { Feed } from '../../graphql/feed';
import { webappUrl } from '../../lib/constants';

export type ExploreCategory = {
  id: string;
  label: string;
  path: string;
  tag?: string;
  matchPaths?: string[];
};

type BuildPersonalizedCategoriesOptions = {
  defaultFeedId?: string;
  isCustomDefaultFeed?: boolean;
};

// Strip the query string and (in the extension build, where `webappUrl` is
// absolute) the host so candidate URLs and `router.asPath` compare uniformly.
export const normalizePath = (p?: string): string => {
  let path = p?.split('?')[0] || '';
  if (/^https?:\/\//.test(path)) {
    try {
      path = new URL(path).pathname;
    } catch {
      // fall through with the original string
    }
  }
  if (!path || path === '/') {
    return path;
  }
  return path.replace(/\/$/, '');
};

type Matchable = {
  id: string;
  matchPaths?: string[];
  path?: string;
  href?: string;
};

// Single source of truth for "which chip is active for the current URL" — used
// by both the desktop chip strip and the mobile feed nav. Returns null when no
// chip matches OR when multiple non-preferred chips match (don't guess).
export const findActiveChipId = (
  items: Matchable[],
  asPath: string,
  { preferId }: { preferId?: string } = {},
): string | null => {
  const normalized = normalizePath(asPath);
  const matches = items.filter((item) => {
    const candidates = item.matchPaths ?? [item.path ?? item.href ?? ''];
    return candidates.some(
      (candidate) => normalizePath(candidate) === normalized,
    );
  });
  if (!matches.length) {
    return null;
  }
  if (preferId) {
    const preferred = matches.find((item) => item.id === preferId);
    if (preferred) {
      return preferred.id;
    }
  }
  if (matches.length === 1) {
    return matches[0].id;
  }
  return null;
};

// Feeds are rendered in the order the API returns them. When a custom feed is
// set as the user's default, route it through `/` (matches sidebar/mobile nav)
// and accept the canonical `/feeds/<slug>`, `/feeds/<id>`, and their `/edit`
// variants as "active" so the chip lights up regardless of how the user got
// to that feed's URL.
export const buildPersonalizedCategories = (
  edges: Edge<Feed>[],
  {
    defaultFeedId,
    isCustomDefaultFeed,
  }: BuildPersonalizedCategoriesOptions = {},
): ExploreCategory[] =>
  edges.map(({ node: feed }) => {
    const isDefault = !!isCustomDefaultFeed && feed.id === defaultFeedId;
    const slugPath = `${webappUrl}feeds/${feed.slug}`;
    const idPath = `${webappUrl}feeds/${feed.id}`;
    const matchPaths = [
      slugPath,
      idPath,
      `${slugPath}/edit`,
      `${idPath}/edit`,
      ...(isDefault ? [webappUrl] : []),
    ];

    return {
      id: feed.id,
      label: feed.flags?.name || `Feed ${feed.id}`,
      path: isDefault ? webappUrl : slugPath,
      tag: feed.id,
      matchPaths,
    };
  });
