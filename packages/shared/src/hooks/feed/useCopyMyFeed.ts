import { useCallback, useSyncExternalStore } from 'react';
import type {
  InfiniteData,
  QueryClient,
  QueryKey,
} from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useActiveFeedNameContext } from '../../contexts/ActiveFeedNameContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import type { FeedItemData } from '../../graphql/feed';
import { getFeedApiItemPost } from '../../graphql/feed';
import type { Post } from '../../graphql/posts';
import { SharedFeedPage } from '../../components/utilities';
import { shouldUseNativeShare } from '../../lib/func';
import { LogEvent, Origin } from '../../lib/log';
import { ReferralCampaignKey } from '../../lib/referral';
import { ShareProvider } from '../../lib/share';
import { useCopyText } from '../useCopy';
import { useGetShortUrl } from '../utils/useGetShortUrl';
import useCustomDefaultFeed from './useCustomDefaultFeed';

export const MAX_COPY_MY_FEED_POSTS = 20;

export type CopyMyFeedPost = Pick<Post, 'id' | 'title' | 'commentsPermalink'>;

// Something a dev would paste in Slack: a short header, then one bullet per
// post. Links go through the tracker so shares are attributable.
export const buildFeedDigest = (
  posts: CopyMyFeedPost[],
  getLink: (url: string) => string = (url) => url,
): string =>
  [
    'My daily.dev feed today:',
    '',
    ...posts.map(
      (post) => `• ${post.title} ${getLink(post.commentsPermalink)}`,
    ),
  ].join('\n');

const isLoadedFeedData = (
  data: unknown,
): data is InfiniteData<FeedItemData> => {
  const pages = (data as InfiniteData<FeedItemData>)?.pages;

  return (
    Array.isArray(pages) && pages.some((page) => !!page?.page?.edges?.length)
  );
};

// The feed queries this surface may digest, newest first. Feed query keys are
// `[feedName, userId, ...variables]` (see `generateQueryKey` +
// `MainFeedLayout`); we prefix-match so variable-suffixed variants (ranking,
// period, feed id) all resolve without re-deriving the exact variables here.
const findNewestFeedQuery = (queryClient: QueryClient, prefixes: QueryKey[]) =>
  prefixes
    .flatMap((queryKey) => queryClient.getQueryCache().findAll({ queryKey }))
    .filter((query) => isLoadedFeedData(query.state.data))
    .sort((a, b) => b.state.dataUpdatedAt - a.state.dataUpdatedAt)[0];

export const collectLoadedFeedPosts = (
  queryClient: QueryClient,
  prefixes: QueryKey[],
): CopyMyFeedPost[] => {
  const newest = findNewestFeedQuery(queryClient, prefixes);

  if (!newest) {
    return [];
  }

  const data = newest.state.data as InfiniteData<FeedItemData>;
  const seen = new Set<string>();

  return data.pages
    .flatMap((page) => page?.page?.edges ?? [])
    .map(({ node }) => getFeedApiItemPost(node))
    .filter((post): post is Post => {
      if (!post?.title || !post?.commentsPermalink || seen.has(post.id)) {
        return false;
      }

      seen.add(post.id);

      return true;
    })
    .slice(0, MAX_COPY_MY_FEED_POSTS);
};

interface UseCopyMyFeedProps {
  /** Skip all cache work (subscription included) while the flag is off. */
  enabled?: boolean;
}

interface UseCopyMyFeed {
  /** Whether the active feed has any loaded posts to digest. */
  hasPosts: boolean;
  isCopying: boolean;
  copyMyFeed: () => Promise<void>;
}

export const useCopyMyFeed = ({
  enabled = true,
}: UseCopyMyFeedProps = {}): UseCopyMyFeed => {
  const queryClient = useQueryClient();
  const { feedName } = useActiveFeedNameContext();
  const { user } = useAuthContext();
  const { isCustomDefaultFeed, defaultFeedId } = useCustomDefaultFeed();
  const { getTrackedUrl } = useGetShortUrl();
  const { logEvent } = useLogContext();
  const [isCopying, copyText] = useCopyText();

  const userId = user?.id ?? 'anonymous';
  const getPrefixes = useCallback((): QueryKey[] => {
    if (!feedName) {
      return [];
    }

    const prefixes: QueryKey[] = [[feedName, userId]];

    // On `/` with a custom default feed the rendered feed is cached under the
    // `custom` key while the active feed name still resolves to `my-feed`.
    if (
      feedName === SharedFeedPage.MyFeed &&
      isCustomDefaultFeed &&
      defaultFeedId
    ) {
      prefixes.push([SharedFeedPage.Custom, userId, defaultFeedId]);
    }

    return prefixes;
  }, [feedName, userId, isCustomDefaultFeed, defaultFeedId]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!enabled) {
        return () => undefined;
      }

      return queryClient.getQueryCache().subscribe(onStoreChange);
    },
    [enabled, queryClient],
  );
  // Cheap primitive snapshot (newest matching feed query's dataUpdatedAt) so
  // the button only re-renders when the loaded feed actually changes.
  const getSnapshot = useCallback(() => {
    if (!enabled) {
      return 0;
    }

    return (
      findNewestFeedQuery(queryClient, getPrefixes())?.state.dataUpdatedAt ?? 0
    );
  }, [enabled, queryClient, getPrefixes]);
  const dataUpdatedAt = useSyncExternalStore(subscribe, getSnapshot, () => 0);

  const copyMyFeed = useCallback(async () => {
    const posts = collectLoadedFeedPosts(queryClient, getPrefixes());

    if (!posts.length) {
      return;
    }

    const digest = buildFeedDigest(posts, (url) =>
      getTrackedUrl(url, ReferralCampaignKey.CopyMyFeed),
    );
    const logShare = (provider: ShareProvider) =>
      logEvent({
        event_name: LogEvent.ShareLog,
        extra: JSON.stringify({
          origin: Origin.CopyMyFeed,
          provider,
          postCount: posts.length,
        }),
      });

    if (shouldUseNativeShare()) {
      try {
        await navigator.share({ text: digest });
        logShare(ShareProvider.Native);
      } catch {
        // the user dismissed the share sheet — nothing happened, nothing to log
      }

      return;
    }

    await copyText({
      textToCopy: digest,
      message: '✅ Copied your feed to clipboard',
    });
    logShare(ShareProvider.CopyLink);
  }, [queryClient, getPrefixes, getTrackedUrl, logEvent, copyText]);

  return { hasPosts: dataUpdatedAt > 0, isCopying, copyMyFeed };
};
