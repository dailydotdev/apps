import {
  InfiniteData,
  MutationCache,
  QueryClient,
  QueryClientConfig,
  QueryKey,
} from '@tanstack/react-query';
import { ClientError } from 'graphql-request';

import { Connection, GARMR_ERROR } from '../graphql/common';
import type { PageInfo } from '../graphql/common';
import { EmptyObjectLiteral } from './kratos';
import { LoggedUser } from './user';
import { FeedData, Post, ReadHistoryPost } from '../graphql/posts';
import type { ReadHistoryInfiniteData } from '../hooks/useInfiniteReadingHistory';
import { SharedFeedPage } from '../components/utilities';
import {
  Comment as PostComment,
  Author as UserAuthor,
  SortCommentsBy,
} from '../graphql/comments';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../graphql/contentPreference';

export enum OtherFeedPage {
  Tag = 'tag',
  Tags = 'tags',
  Squad = 'squadsdiscover',
  SquadPage = 'squadsdiscover[id]',
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
  Discussed = 'discussed',
  Following = 'following',
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
  OneDay = ONE_HOUR * 24,
}

export type AllFeedPages = SharedFeedPage | OtherFeedPage;

export type MutateFunc<T> = (variables: T) => Promise<(() => void) | undefined>;

export const getNextPageParam = (pageInfo: PageInfo): null | string => {
  if (!pageInfo?.hasNextPage || !pageInfo?.endCursor) {
    return null;
  }
  return pageInfo?.hasNextPage && pageInfo?.endCursor;
};

export const generateQueryKey = (
  name: RequestKey | AllFeedPages,
  user?: Pick<LoggedUser, 'id'>,
  ...additional: unknown[]
): [RequestKey | AllFeedPages, string, ...unknown[]] => {
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
  SourcePostModeration = 'source_post_moderation',
  Actions = 'actions',
  Squad = 'squad',
  SquadPostRequests = 'squad_post_requests',
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
  UserStreakRecover = 'user_streak_recover',
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
  Sources = 'sources',
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
  SlackChannels = 'slack_channels',
  UserIntegrations = 'user_integrations',
  UserSourceIntegrations = 'user_source_integrations',
  SourceFeed = 'sourceFeed',
  SourceMostUpvoted = 'sourceMostUpvoted',
  SourceBestDiscussed = 'sourceBestDiscussed',
  TagFeed = 'tagFeed',
  TagsMostUpvoted = 'tagsMostUpvoted',
  TagsBestDiscussed = 'tagsBestDiscussed',
  UserCompanies = 'user_companies',
  PostCodeSnippets = 'post_code_snippets',
  ContentPreference = 'content_preference',
  UserFollowers = 'user_followers',
  UserFollowing = 'user_following',
  UserBlocked = 'user_blocked',
  ContentPreferenceFollow = 'content_preference_follow',
  ContentPreferenceUnfollow = 'content_preference_unfollow',
  ContentPreferenceSubscribe = 'content_preference_subscribe',
  ContentPreferenceUnsubscribe = 'content_preference_unsubscribe',
  ContentPreferenceBlock = 'content_preference_block',
  ContentPreferenceUnblock = 'content_preference_unblock',
  TopReaderBadge = 'top_reader_badge',
  ReferringUser = 'referring_user',
  SearchSources = 'search_sources',
  OnboardingSources = 'onboarding_sources',
  UserShortById = 'user_short_by_id',
  BookmarkFolders = 'bookmark_folders',
  FetchedOriginalTitle = 'fetched_original_title',
}

export type HasConnection<
  TEntity,
  TKey extends keyof TEntity = keyof TEntity,
  TReturn = unknown,
> = Partial<Record<TKey, Connection<TReturn>>>;

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
      retry: (failureCount, error) => {
        const clientError = error as ClientError;
        if (
          clientError?.response?.errors?.[0]?.extensions?.code === GARMR_ERROR
        ) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: process.env.NODE_ENV !== 'development',
    },
  },
};

export const updateCachedPage = (
  feedQueryKey: QueryKey,
  queryClient: QueryClient,
  pageIndex: number,
  manipulate: (page: Connection<Post>) => Connection<Post>,
): void => {
  queryClient.setQueryData<InfiniteData<FeedData>>(
    feedQueryKey,
    (currentData) => {
      const { pages } = currentData;
      const currentPage = structuredClone(pages[pageIndex]);
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
  (feedQueryKey: QueryKey, queryClient: QueryClient) =>
  (pageIndex: number, index: number, post: Post): void => {
    updateCachedPage(feedQueryKey, queryClient, pageIndex, (page) => {
      // eslint-disable-next-line no-param-reassign
      page.edges[index].node = post;
      return page;
    });
  };

export const removeCachedPagePost =
  (feedQueryKey: QueryKey, queryClient: QueryClient) =>
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
  queryKey: QueryKey;
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
    const updatedPage = structuredClone(currentData.pages[pageIndex]);
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

export const updateAuthorContentPreference = ({
  data,
  status,
  entity,
}: {
  data: UserAuthor;
  status: ContentPreferenceStatus | null;
  entity: ContentPreferenceType;
}): UserAuthor => {
  const newData = structuredClone(data);

  if (!status) {
    newData.contentPreference = undefined;

    return newData;
  }

  newData.contentPreference = {
    status,
    type: entity,
    referenceId: newData.id,
    createdAt: new Date(),
    user: {
      id: newData.id,
      name: newData.name,
      image: newData.image,
      username: newData.username,
    },
  };

  return newData;
};

export const updatePostContentPreference = ({
  data,
  status,
  entity,
  entityId,
}: {
  data: Post;
  status: ContentPreferenceStatus | null;
  entityId: string;
  entity: ContentPreferenceType;
}): Post => {
  if (typeof status === 'undefined') {
    return data;
  }

  const newData = structuredClone(data);

  if (newData.author?.id === entityId) {
    newData.author = updateAuthorContentPreference({
      data: newData.author,
      status,
      entity,
    });
  }

  if (newData.scout?.id === entityId) {
    newData.scout = updateAuthorContentPreference({
      data: newData.scout,
      status,
      entity,
    });
  }

  return newData;
};

export const updateCommentContentPreference = ({
  data,
  status,
  entity,
  entityId,
}: {
  data: PostComment;
  status: ContentPreferenceStatus | null;
  entityId: string;
  entity: ContentPreferenceType;
}): PostComment => {
  if (typeof status === 'undefined') {
    return data;
  }

  const newData = structuredClone(data);

  if (newData.author?.id === entityId) {
    newData.author = updateAuthorContentPreference({
      data: newData.author,
      status,
      entity,
    });
  }

  return newData;
};

type QueryKeyReturnType = ReturnType<typeof generateQueryKey>;

interface GenerateCommentsQueryKeyProps {
  postId: string;
  sortBy: SortCommentsBy;
}

export const generateCommentsQueryKey = ({
  postId,
  sortBy,
}: GenerateCommentsQueryKeyProps): QueryKeyReturnType =>
  generateQueryKey(RequestKey.PostComments, null, { postId, sortBy });

export const getAllCommentsQuery = (postId: string): QueryKeyReturnType[] => {
  const sorting = Object.values(SortCommentsBy).map((sortBy) =>
    generateCommentsQueryKey({ postId, sortBy }),
  );

  return sorting;
};
