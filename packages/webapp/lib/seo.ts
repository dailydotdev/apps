import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import type { Deal } from '@dailydotdev/shared/src/features/deals/types';
import { DealMediaKind } from '@dailydotdev/shared/src/features/deals/types';

const DEFAULT_APP_ORIGIN = 'https://daily.dev';
const DEFAULT_SITE_ORIGIN = 'https://daily.dev';

const normalizeOrigin = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (value.startsWith('/')) {
    return undefined;
  }

  const withProtocol =
    value.startsWith('http://') || value.startsWith('https://')
      ? value
      : `https://${value}`;

  return withProtocol.endsWith('/') ? withProtocol.slice(0, -1) : withProtocol;
};

export const getAppOrigin = (): string =>
  normalizeOrigin(process.env.NEXT_PUBLIC_WEBAPP_URL) || DEFAULT_APP_ORIGIN;

export const getSiteOrigin = (): string =>
  normalizeOrigin(process.env.NEXT_PUBLIC_SITE_ORIGIN) || DEFAULT_SITE_ORIGIN;

export const getLlmsTxtUrl = (): string => `${getAppOrigin()}/llms.txt`;

export const getPostCanonicalUrl = (slug: string): string =>
  `${getAppOrigin()}/posts/${slug}`;

export const toAbsoluteUrl = (url: string): string =>
  url.startsWith('http') ? url : `${getAppOrigin()}${url}`;

/**
 * Crawlers, share unfurlers and the agent feeds all need an absolute image, and
 * they all resolve it from the same media the page renders. A deal without
 * media resolves to nothing rather than to a placeholder.
 */
export const getDealImageUrl = (deal: Deal): string | undefined =>
  deal.media && toAbsoluteUrl(deal.media.imageUrl);

/**
 * Brand marks resolve to a 128px favicon, far below the ~1200px social
 * unfurlers and Google want, so they fall back to the default share image
 * rather than shipping a thumbnail as the preview.
 */
export const getDealSocialImage = (
  deal: Deal,
): { url: string; alt: string } | undefined => {
  if (!deal.media || deal.media.kind === DealMediaKind.Brand) {
    return undefined;
  }

  const url = getDealImageUrl(deal);

  return url ? { url, alt: deal.media.alt } : undefined;
};

const THIN_NOINDEX_POST_TYPES = [PostType.Brief, PostType.SocialTwitter];

/** Structural subset of {@link Post} so non-page callers can reuse the gate. */
export interface NoindexPostFields {
  type: Post['type'];
  private?: boolean;
  source?: { public?: boolean };
  author?: { reputation?: number };
}

export const shouldNoindexPost = (post: NoindexPostFields): boolean => {
  // Posts in private squads normally fail the unauthenticated ISR fetch, but a
  // cached page can outlive a squad turning private, so fail closed here too.
  if (post?.private || post?.source?.public === false) {
    return true;
  }

  const hasLowReputationAuthor =
    typeof post?.author?.reputation === 'number' &&
    post.author.reputation <= 10;

  if (hasLowReputationAuthor) {
    return true;
  }

  return THIN_NOINDEX_POST_TYPES.includes(post.type);
};
