import {
  InfiniteData,
  MutationCache,
  QueryClient,
  QueryClientConfig,
  QueryKey,
} from '@tanstack/react-query';
import cloneDeep from 'lodash.clonedeep';
import { Connection } from '../graphql/common';
import { EmptyObjectLiteral } from './kratos';
import { LoggedUser } from './user';
import { FeedData, Post, ReadHistoryPost } from '../graphql/posts';
import { ReadHistoryInfiniteData } from '../hooks/useInfiniteReadingHistory';
import { SharedFeedPage } from '../components/utilities';

export enum OtherFeedPage {
  Tag = 'tag',
  Tags = 'tags',
  Squad = 'squads',
  SquadPage = 'squads[handle]',
  Source = 'source',
  Sources = 'sources',
  Leaderboard = 'users',
  Bookmarks = 'bookmarks',
  SearchBookmarks = 'search-bookmarks',
  Preview = 'preview',
  Author = 'author',
  UserUpvoted = 'user-upvoted',
  UserPosts = 'user-posts',
  History = 'history',
  Notifications = 'notifications',
  TagPage = 'tags[tag]',
  SourcePage = 'sources[source]',
  SourceMostUpvoted = 'sources[source]/most-upvoted',
  SourceBestDiscussed = 'sources[source]/best-discussed',
  TagsMostUpvoted = 'tags[tag]/most-upvoted',
  TagsBestDiscussed = 'tags[tag]/best-discussed',
  Explore = 'posts',
  ExploreLatest = 'postslatest',
  ExploreDiscussed = 'postsdiscussed',
  ExploreUpvoted = 'postsupvoted',
  FeedByIds = 'feed-by-ids',
  Welcome = 'welcome',
}

const ONE_MINUTE = 60 * 1000;
const THIRTY_MINUTES = ONE_MINUTE * 30;
const FIVE_MINUTES = ONE_MINUTE * 5;
const ONE_HOUR = ONE_MINUTE * 60;
export const STALE_TIME = 30 * 1000;

export enum StaleTime {
  Default = FIVE_MINUTES,
  FeedSettings = ONE_MINUTE,
  Tooltip = THIRTY_MINUTES,
  OneHour = ONE_HOUR,
  Base = STALE_TIME,
}

export type AllFeedPages = SharedFeedPage | OtherFeedPage;

export type MutateFunc<T> = (variables: T) => Promise<(() => void) | undefined>;

export const generateQueryKey = (
  name: RequestKey | AllFeedPages,
  user?: Pick<LoggedUser, 'id'>,
  ...additional: unknown[]
): unknown[] => {
  return [name, user?.id ?? 'anonymous', ...additional];
};

export const generateStorageKey = (
  key: RequestKey,
  ...params: string[]
): string =>
  (generateQueryKey(key, null, ...params) as Array<string>).join(':');

export enum RequestKey {
  DevCard = 'devcard',
  Providers = 'providers',
  Bookmarks = 'bookmarks',
  PostComments = 'post_comments',
  PostCommentsMutations = 'post_comments_mutations',
  Actions = 'actions',
  Squad = 'squad',
  SquadMembers = 'squad_members',
  Search = 'search',
  SearchHistory = 'searchHistory',
  ReadingHistory = 'readingHistory',
  ReferralCampaigns = 'referral_campaigns',
  ContextMenu = 'context_menu',
  NotificationPreference = 'notification_preference',
  Banner = 'latest_banner',
  Auth = 'auth',
  Profile = 'profile',
  CurrentSession = 'current_session',
  ReadingStreak30Days = 'reading_streak_30_days',
  UserStreak = 'user_streak',
  PersonalizedDigest = 'personalizedDigest',
  Changelog = 'changelog',
  Tags = 'tags',
  FeedPreview = 'feedPreview',
  FeedPreviewCustom = 'feedPreviewCustom',
  ReferredUsers = 'referred',
  PostKey = 'post',
  Prompt = 'prompt',
  Comment = 'comment',
  SquadTour = 'squad_tour',
  RelatedPosts = 'related_posts',
  PublicSourceMemberships = 'public_source_memberships',
  ReadingStats = 'reading_stats',
  UserComments = 'user_comments',
  Readme = 'readme',
  Host = 'host',
  Source = 'source',
  OneSignal = 'onesignal',
  ActiveUsers = 'active_users',
  PushNotification = 'push_notification',
  ShortUrl = 'short_url',
  SourceRequestAvailability = 'source_request_availability',
  CommentFeed = 'comment_feed',
  Feature = 'feature',
  AccountNavigation = 'account_navigation',
  RecommendedTags = 'recommended_tags',
  SourceRelatedTags = 'source_related_tags',
  SourceByTag = 'source_by_tag',
  SimilarSources = 'similar_sources',
  UserExperienceLevel = 'user_experience_level',
  SquadStatus = 'squad_status',
  PublicSquadRequests = 'public_squad_requests',
  Feeds = 'feeds',
  FeedSettings = 'feedSettings',
  Ads = 'ads',
  FeedByIds = 'feedByIds',
}

export type HasConnection<
  TEntity,
  TKey extends keyof TEntity = keyof TEntity,
> = Partial<Record<TKey, Connection<unknown>>>;

interface InfiniteCacheProps<
  TEntity extends HasConnection<TEntity>,
  TKey extends keyof TEntity = keyof TEntity,
> {
  prop: TKey;
  queryKey: QueryKey;
  client: QueryClient;
}

interface UpdateInfiniteCacheProps<
  TEntity extends HasConnection<TEntity>,
  TData extends TEntity[TKey]['edges'][0]['node'],
  TKey extends keyof TEntity = keyof TEntity,
> extends InfiniteCacheProps<TEntity, TKey> {
  page: number;
  edge: number;
  entity: Partial<TData>;
}

export const updateInfiniteCache = <
  TEntity extends HasConnection<TEntity>,
  TKey extends keyof TEntity = keyof TEntity,
  TData extends TEntity[TKey]['edges'][0]['node'] = TEntity[TKey]['edges'][0]['node'],
  TReturn extends InfiniteData<TEntity> = InfiniteData<TEntity>,
>({
  client,
  prop,
  queryKey,
  page,
  edge,
  entity,
}: UpdateInfiniteCacheProps<TEntity, TData>): TReturn => {
  return client.setQueryData<TReturn>(queryKey, (data) => {
    if (!data) {
      return null;
    }

    const updated = { ...data };
    const item = updated.pages[page][prop].edges[edge]
      .node as EmptyObjectLiteral;
    updated.pages[page][prop].edges[edge].node = { ...item, ...entity };

    return updated;
  });
};

export const mutationSuccessSubscribers: Map<
  string,
  MutationCache['config']['onSuccess']
> = new Map();

export const globalMutationCache = new MutationCache({
  onSuccess: (...args) => {
    mutationSuccessSubscribers.forEach((subscriber) => subscriber(...args));
  },
});

export const defaultQueryClientConfig: QueryClientConfig = {
  mutationCache: globalMutationCache,
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: process.env.NODE_ENV !== 'development',
    },
  },
};

export const updateCachedPage = (
  feedQueryKey: unknown[],
  queryClient: QueryClient,
  pageIndex: number,
  manipulate: (page: Connection<Post>) => Connection<Post>,
): void => {
  queryClient.setQueryData<InfiniteData<FeedData>>(
    feedQueryKey,
    (currentData) => {
      const { pages } = currentData;
      const currentPage = cloneDeep(pages[pageIndex]);
      currentPage.page = manipulate(currentPage.page);
      const newPages = [
        ...pages.slice(0, pageIndex),
        currentPage,
        ...pages.slice(pageIndex + 1),
      ];
      return { pages: newPages, pageParams: currentData.pageParams };
    },
  );
};

export const updateCachedPagePost =
  (feedQueryKey: unknown[], queryClient: QueryClient) =>
  (pageIndex: number, index: number, post: Post): void => {
    updateCachedPage(feedQueryKey, queryClient, pageIndex, (page) => {
      // eslint-disable-next-line no-param-reassign
      page.edges[index].node = post;
      return page;
    });
  };

export const removeCachedPagePost =
  (feedQueryKey: unknown[], queryClient: QueryClient) =>
  (pageIndex: number, index: number): void => {
    updateCachedPage(feedQueryKey, queryClient, pageIndex, (page) => {
      // eslint-disable-next-line no-param-reassign
      page.edges.splice(index, 1);
      return page;
    });
  };

export const updateReadingHistoryListPost = ({
  queryKey,
  pageIndex,
  index,
  manipulate,
  queryClient,
}: {
  queryKey: unknown[];
  pageIndex: number;
  index: number;
  manipulate: (post: ReadHistoryPost) => ReadHistoryPost;
  queryClient: QueryClient;
}): (() => void) => {
  const oldData = !!queryClient.getQueryData<ReadHistoryInfiniteData>(queryKey);

  if (!oldData) {
    return () => undefined;
  }

  queryClient.setQueryData<ReadHistoryInfiniteData>(queryKey, (currentData) => {
    const updatedPage = cloneDeep(currentData.pages[pageIndex]);
    const currentPostNode = updatedPage.readHistory.edges[index].node;

    currentPostNode.post = {
      ...currentPostNode.post,
      ...manipulate(currentPostNode.post),
    };

    const updatedPages = [...currentData.pages];
    updatedPages.splice(pageIndex, 1, updatedPage);

    return {
      ...currentData,
      pages: updatedPages,
    };
  });

  return () => {
    queryClient.setQueryData(queryKey, oldData);
  };
};
