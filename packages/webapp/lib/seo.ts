import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';

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

export const getPostMarkdownUrl = ({
  post,
}: {
  post: Pick<Post, 'id' | 'slug'>;
}): string => `${getPostCanonicalUrl(post.slug ?? post.id)}.md`;

const THIN_NOINDEX_POST_TYPES = [PostType.Brief, PostType.SocialTwitter];

/** Structural subset of {@link Post} so non-page callers can reuse the gate. */
export interface NoindexPostFields {
  type: Post['type'];
  noindex?: boolean;
  private?: boolean;
  source?: { public?: boolean };
}

export const shouldNoindexPost = (post: NoindexPostFields): boolean => {
  // The API owns the full gate: banned, deleted, private, vordr and
  // low-reputation or shadow-banned authors and scouts.
  if (post?.noindex) {
    return true;
  }

  // Posts in private squads normally fail the unauthenticated ISR fetch, but a
  // cached page can outlive a squad turning private, so fail closed here too.
  if (post?.private || post?.source?.public === false) {
    return true;
  }

  return THIN_NOINDEX_POST_TYPES.includes(post.type);
};
